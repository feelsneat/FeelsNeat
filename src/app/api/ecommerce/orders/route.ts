import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';
import {
  EcommerceOrder,
  OrderItemSnapshot,
  Payment,
  PaymentMethod,
  OrderStatus,
  OrderTimelineEvent,
  EstimatedMargin,
} from '@/lib/ecommerce/types';
import { getPaymentProvider } from '@/lib/ecommerce/payments/mock';

export const runtime = 'edge';

function generateOrderNumber(existingOrders: EcommerceOrder[]): { id: string; num: number } {
  let maxNum = 10000;
  existingOrders.forEach((o) => {
    if (o.orderNumber && o.orderNumber > maxNum) maxNum = o.orderNumber;
  });
  const nextNum = maxNum + 1;
  return {
    id: `FN-${nextNum}`,
    num: nextNum,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      shippingAddress,
      billingAddress,
      items = [],
      discountCode,
      paymentMethod = 'PREPAID',
    } = body as {
      customer: { name: string; email: string; phone: string };
      shippingAddress: any;
      billingAddress?: any;
      items: Array<{ productId: string; variantId?: string; quantity: number }>;
      discountCode?: string;
      paymentMethod: PaymentMethod;
    };

    // 1. Validation
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: 'Customer name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    if (
      !shippingAddress?.line1 ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return NextResponse.json(
        { error: 'Full shipping address (Street, City, State, Pincode) is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one product.' }, { status: 400 });
    }

    const db = await loadEcommerceDb(req.url);
    const hasDropshipItems = items.some((item) => {
      const product = db.products.find((p) => p.id === item.productId && p.status === 'ACTIVE');
      return product && (product.fulfillmentType || 'DROPSHIP') === 'DROPSHIP';
    });

    if (hasDropshipItems && (!process.env.ALISHIPPING_API_KEY || !process.env.ALISHIPPING_API_SECRET)) {
      return NextResponse.json(
        { error: 'Dropshipping is not enabled yet. AliShipping credentials must be configured before placing this order.' },
        { status: 503 }
      );
    }

    if (hasDropshipItems && paymentMethod === 'PREPAID' &&
      (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET)) {
      return NextResponse.json(
        { error: 'Online payments are not enabled yet. Cashfree credentials must be configured before placing prepaid orders.' },
        { status: 503 }
      );
    }

    // 2. Server-side price & item snapshot calculation
    const itemSnapshots: OrderItemSnapshot[] = [];
    let subtotal = 0;
    let totalSupplierCost = 0;

    for (const item of items) {
      const product = db.products.find((p) => p.id === item.productId && p.status === 'ACTIVE');
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.productId}" is currently unavailable.` },
          { status: 400 }
        );
      }
      if (product.fulfillmentType === 'AFFILIATE') {
        return NextResponse.json(
          { error: `"${product.title}" is purchased through its partner site and cannot be checked out here.` },
          { status: 400 }
        );
      }

      let unitPrice = product.sellingPrice;
      let title = product.title;
      let variantTitle: string | undefined;
      let sku = product.sku;
      let supplierSku = product.supplierMapping?.supplierSku;
      let supplierCost = product.supplierMapping?.supplierCost || product.costPrice || 0;
      let availableStock = product.stockQuantity;
      let image = product.images[0] || '';

      if (product.hasVariants && item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId && v.active);
        if (!variant) {
          return NextResponse.json(
            { error: `Selected variant for "${product.title}" is unavailable.` },
            { status: 400 }
          );
        }
        unitPrice = variant.sellingPrice;
        variantTitle = variant.title;
        sku = variant.sku;
        supplierSku = variant.supplierSku || variant.supplierMapping?.supplierSku || supplierSku;
        supplierCost = variant.supplierMapping?.supplierCost || variant.costPrice || supplierCost;
        availableStock = variant.stockQuantity;
        if (variant.image) image = variant.image;
      }

      const qty = Math.max(1, Math.min(item.quantity || 1, 50));
      if (qty > availableStock) {
        return NextResponse.json(
          { error: `Requested quantity for "${title}" exceeds available stock (${availableStock}).` },
          { status: 400 }
        );
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;
      totalSupplierCost += supplierCost * qty;

      itemSnapshots.push({
        productId: product.id,
        variantId: item.variantId,
        sku,
        supplierSku,
        title,
        variantTitle,
        unitPrice,
        supplierCost,
        quantity: qty,
        discount: 0,
        tax: 0,
        lineTotal,
        image,
      });
    }

    // 3. Discount calculation
    let discountAmount = 0;
    let appliedCode: string | undefined;

    if (discountCode && discountCode.trim()) {
      const cleanCode = discountCode.trim().toUpperCase();
      const discount = db.discounts.find((d) => d.code.toUpperCase() === cleanCode && d.active);
      if (discount && subtotal >= discount.minOrderValue) {
        if (discount.discountType === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * discount.value) / 100);
          if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
            discountAmount = discount.maxDiscount;
          }
        } else {
          discountAmount = discount.value;
        }
        appliedCode = discount.code;
        discount.usageCount += 1;
      }
    }

    // 4. Shipping & COD Fee
    const freeShippingThreshold = db.settings.freeShippingThreshold || 999;
    const shippingCharge = subtotal >= freeShippingThreshold ? 0 : db.settings.standardShippingFee || 60;
    const codFee = paymentMethod === 'COD' && db.settings.codAvailable ? (db.settings.codFee || 40) : 0;
    const total = Math.max(0, subtotal - discountAmount + shippingCharge + codFee);

    // 5. Estimated Margin Calculation (Admin estimate only)
    const estimatedPaymentFee = paymentMethod === 'COD' ? 0 : Math.round((total * (db.settings.estimatedPaymentFeePercent || 2)) / 100);
    const estimatedRtoCost = db.settings.estimatedRtoCostPerOrder || 30;
    const estimatedProfit = Math.round(total - (totalSupplierCost + shippingCharge + estimatedPaymentFee + estimatedRtoCost));

    const estimatedMargin: EstimatedMargin = {
      sellingPrice: total,
      supplierCost: totalSupplierCost,
      estimatedShipping: shippingCharge,
      estimatedPaymentFee,
      estimatedRtoCost,
      estimatedProfit,
    };

    // 6. Generate IDs
    const { id: orderId, num: orderNumber } = generateOrderNumber(db.orders);
    const paymentId = `PAY-${orderNumber}`;
    const now = new Date().toISOString();

    const initialTimeline: OrderTimelineEvent[] = [
      {
        id: `evt-${Date.now()}-1`,
        orderId,
        event: 'Order Created',
        timestamp: now,
        source: 'CUSTOMER',
        actor: customer.name,
        notes: `Order created via FeelsNeat Storefront. Total: ₹${total} (${paymentMethod})`,
      },
    ];

    // 7. Initialize Internal Order
    const newOrder: EcommerceOrder = {
      id: orderId,
      trackingToken: crypto.randomUUID(),
      orderNumber,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      shippingAddress: {
        name: shippingAddress.name || customer.name,
        phone: shippingAddress.phone || customer.phone,
        email: shippingAddress.email || customer.email,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India',
      },
      billingAddress: billingAddress || undefined,
      items: itemSnapshots,
      subtotal,
      discountCode: appliedCode,
      discountAmount,
      shippingCharge,
      taxAmount: 0,
      total,
      paymentMethod,
      paymentStatus: 'PENDING',
      paymentId,
      orderStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT',
      fulfillmentStatus: paymentMethod === 'COD' ? 'PENDING' : 'NOT_CREATED',
      timeline: initialTimeline,
      adminNotes: [],
      estimatedMargin,
      createdAt: now,
      updatedAt: now,
    };

    // 8. Payment Initiation
    const newPayment: Payment = {
      id: paymentId,
      orderId,
      provider: paymentMethod === 'COD' ? 'COD' : (process.env.CASHFREE_CLIENT_ID ? 'CASHFREE' : 'MOCK'),
      amount: total,
      currency: 'INR',
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'ONLINE',
      status: 'PENDING',
      refundStatus: 'NONE',
      refundAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    let paymentRedirectUrl: string | undefined;
    let paymentSessionId: string | undefined;

    if (paymentMethod === 'PREPAID') {
      const providerType = process.env.CASHFREE_CLIENT_ID ? 'CASHFREE' : 'MOCK';
      const paymentProvider = getPaymentProvider(providerType);
      const origin = req.headers.get('origin') || 'http://localhost:8085';
      const returnUrl = `${origin}/shop/order-confirmation/${orderId}?token=${newOrder.trackingToken}`;
      const notifyUrl = `${origin}/api/webhooks/cashfree`;

      try {
        const payResult = await paymentProvider.createPaymentOrder({
          order: newOrder,
          returnUrl,
          notifyUrl,
        });

        newPayment.providerOrderId = payResult.providerOrderId;
        paymentSessionId = payResult.paymentSessionId;
        paymentRedirectUrl = payResult.paymentUrl;
      } catch (payErr: any) {
        console.error('Payment order creation warning:', payErr);
        // Still save order as PENDING_PAYMENT
      }
    } else {
      // For COD, record confirmation event directly
      newOrder.timeline.push({
        id: `evt-${Date.now()}-2`,
        orderId,
        event: 'Order Confirmed (COD)',
        timestamp: now,
        source: 'SYSTEM',
        actor: 'System',
        notes: 'Cash on Delivery order placed. Payment due upon delivery.',
      });
    }

    newOrder.paymentDetails = newPayment;

    // 9. Save Order & Payment
    db.orders.unshift(newOrder);
    db.payments.unshift(newPayment);
    await saveEcommerceDb(req.url, db);

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      total,
      paymentMethod,
      paymentSessionId,
      paymentRedirectUrl: paymentRedirectUrl || `/shop/order-confirmation/${orderId}?token=${newOrder.trackingToken}`,
      trackingToken: newOrder.trackingToken,
    });
  } catch (error: any) {
    console.error('Failed to create ecommerce order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
