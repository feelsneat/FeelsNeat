import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb } from '@/lib/ecommerce/db';

export const runtime = 'edge';

interface CartInputItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items = [], discountCode, paymentMethod = 'PREPAID' } = body as {
      items: CartInputItem[];
      discountCode?: string;
      paymentMethod?: 'PREPAID' | 'COD';
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        valid: true,
        items: [],
        subtotal: 0,
        discountAmount: 0,
        shippingCharge: 0,
        codFee: 0,
        taxAmount: 0,
        total: 0,
      });
    }

    const db = await loadEcommerceDb(req.url);
    const validatedItems: any[] = [];
    let subtotal = 0;
    const errors: string[] = [];

    for (const item of items) {
      const product = db.products.find((p) => p.id === item.productId && p.status === 'ACTIVE');
      if (!product) {
        errors.push(`Product with ID "${item.productId}" is no longer available.`);
        continue;
      }
      if (product.fulfillmentType === 'AFFILIATE') {
        errors.push(`"${product.title}" is purchased through its partner site and cannot be added to this cart.`);
        continue;
      }

      let unitPrice = product.sellingPrice;
      let title = product.title;
      let variantTitle: string | undefined;
      let sku = product.sku;
      let availableStock = product.stockQuantity;
      let image = product.images[0] || '';

      if (product.hasVariants && item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId && v.active);
        if (!variant) {
          errors.push(`Variant for "${product.title}" is no longer available.`);
          continue;
        }
        unitPrice = variant.sellingPrice;
        variantTitle = variant.title;
        sku = variant.sku;
        availableStock = variant.stockQuantity;
        if (variant.image) image = variant.image;
      }

      const qty = Math.max(1, Math.min(item.quantity || 1, 50));
      if (qty > availableStock) {
        errors.push(`Only ${availableStock} units available for "${title}${variantTitle ? ` (${variantTitle})` : ''}".`);
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        variantId: item.variantId,
        sku,
        title,
        variantTitle,
        unitPrice,
        quantity: qty,
        lineTotal,
        image,
      });
    }

    // Discount validation
    let discountAmount = 0;
    let appliedDiscount: any = null;
    let discountError: string | undefined;

    if (discountCode && discountCode.trim()) {
      const cleanCode = discountCode.trim().toUpperCase();
      const discount = db.discounts.find((d) => d.code.toUpperCase() === cleanCode && d.active);

      if (!discount) {
        discountError = 'Invalid or expired discount coupon code.';
      } else if (subtotal < discount.minOrderValue) {
        discountError = `Coupon requires a minimum order value of ₹${discount.minOrderValue}.`;
      } else {
        if (discount.discountType === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * discount.value) / 100);
          if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
            discountAmount = discount.maxDiscount;
          }
        } else {
          discountAmount = discount.value;
        }
        appliedDiscount = {
          code: discount.code,
          discountType: discount.discountType,
          value: discount.value,
          amount: discountAmount,
        };
      }
    }

    // Shipping calculation
    const freeShippingThreshold = db.settings.freeShippingThreshold || 999;
    const standardShipping = db.settings.standardShippingFee || 60;
    const shippingCharge = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShipping;

    // COD fee
    const codFee = paymentMethod === 'COD' && db.settings.codAvailable ? (db.settings.codFee || 40) : 0;

    const total = Math.max(0, subtotal - discountAmount + shippingCharge + codFee);

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      items: validatedItems,
      subtotal,
      discountAmount,
      appliedDiscount,
      discountError,
      shippingCharge,
      codFee,
      taxAmount: 0,
      total,
      currency: 'INR',
    });
  } catch (error: any) {
    console.error('Cart validation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
