import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';
import { RazorpayPaymentProvider } from '@/lib/ecommerce/payments/razorpay';
import { isDigitalProduct } from '@/lib/ecommerce/product-classification';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Incomplete Razorpay payment verification details.' }, { status: 400 });
    }

    const provider = new RazorpayPaymentProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 });
    }

    const valid = await provider.verifyCheckoutSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!valid) return NextResponse.json({ error: 'Invalid Razorpay payment signature.' }, { status: 401 });

    const db = await loadEcommerceDb(req.url);
    const order = db.orders.find((candidate) => candidate.id === orderId);
    if (!order || order.paymentDetails?.providerOrderId !== razorpayOrderId) {
      return NextResponse.json({ error: 'Order/payment mismatch.' }, { status: 400 });
    }
    const verifiedPayment = await provider.verifyPayment(razorpayOrderId);
    if (verifiedPayment.status !== 'PAID' || Math.round(verifiedPayment.amount * 100) !== Math.round(order.total * 100)) {
      return NextResponse.json({ error: 'Razorpay payment amount or status could not be verified.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const entitlements = db.entitlements || (db.entitlements = []);
    const payment = db.payments.find((candidate) => candidate.orderId === order.id);
    if (!payment) return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });

    payment.provider = 'RAZORPAY';
    payment.providerPaymentId = razorpayPaymentId;
    payment.status = 'PAID';
    payment.paidAt = now;
    payment.updatedAt = now;
    order.paymentDetails = payment;
    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    const digitalProducts = order.items
      .map((item) => db.products.find((product) => product.id === item.productId))
      .filter((product) => product && isDigitalProduct(product));
    for (const product of digitalProducts) {
      if (!product || entitlements.some((entitlement) => entitlement.orderId === order.id && entitlement.productId === product.id)) continue;
      entitlements.unshift({
        id: `ENT-${order.orderNumber}-${product.id}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        productId: product.id,
        productTitle: product.title,
        customerEmail: order.customer.email,
        customerName: order.customer.name,
        versionPurchased: product.version || '1.0',
        status: 'ACTIVE',
        purchaseDate: now,
        downloadCount: 0,
        lastDownloadedAt: null,
        fileIds: product.downloadableFiles?.map((file) => file.id) || [],
      });
    }
    if (digitalProducts.length > 0) {
      order.orderStatus = 'FULFILLED';
      order.fulfillmentStatus = 'FULFILLED';
    }
    order.updatedAt = now;
    await saveEcommerceDb(req.url, db);

    return NextResponse.json({ success: true, orderId: order.id, paymentStatus: order.paymentStatus });
  } catch (error: any) {
    console.error('Razorpay payment verification failed:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed.' }, { status: 500 });
  }
}
