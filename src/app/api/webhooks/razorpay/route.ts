import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';
import { RazorpayPaymentProvider } from '@/lib/ecommerce/payments/razorpay';
import { isDigitalProduct } from '@/lib/ecommerce/product-classification';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
  const razorpay = new RazorpayPaymentProvider();

  if (!(await razorpay.verifyWebhookSignature(headers, rawBody))) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const event = razorpay.parseWebhookEvent(rawBody);
  if (!event?.orderId) return NextResponse.json({ error: 'Unable to parse webhook order event' }, { status: 400 });

  const db = await loadEcommerceDb(req.url);
  const order = db.orders.find((candidate) => candidate.id === event.orderId);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (event.paymentStatus === 'PENDING') {
    return NextResponse.json({ success: true, message: 'No terminal payment state to process.' });
  }
  const payment = db.payments.find((candidate) => candidate.orderId === order.id);
  if (
    !payment ||
    payment.provider !== 'RAZORPAY' ||
    payment.providerOrderId !== event.providerOrderId ||
    event.currency !== payment.currency ||
    Math.round(event.amount * 100) !== Math.round(order.total * 100)
  ) {
    return NextResponse.json({ error: 'Razorpay webhook does not match the order payment.' }, { status: 400 });
  }
  if (order.paymentStatus === 'PAID') return NextResponse.json({ success: true, message: 'Already processed' });

  const now = new Date().toISOString();
  const entitlements = db.entitlements || (db.entitlements = []);
  payment.provider = 'RAZORPAY';
  payment.status = event.paymentStatus;
  payment.providerOrderId = event.providerOrderId;
  payment.providerPaymentId = event.providerPaymentId || payment.providerPaymentId;
  payment.gatewayResponse = event.rawEvent;
  payment.updatedAt = now;

  order.paymentDetails = payment;
  order.paymentStatus = event.paymentStatus;
  order.orderStatus = event.paymentStatus === 'PAID' ? 'CONFIRMED' : 'PAYMENT_FAILED';
  if (event.paymentStatus === 'PAID') {
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
    } else {
      order.fulfillmentStatus = 'PENDING';
    }
  }
  order.updatedAt = now;
  order.timeline.push({
    id: `evt-${Date.now()}`,
    orderId: order.id,
    event: event.paymentStatus === 'PAID' ? 'Payment Confirmed' : 'Payment Failed',
    timestamp: now,
    source: 'RAZORPAY',
    actor: 'Razorpay Webhook',
    notes: `Razorpay payment ${event.providerPaymentId || 'event'} received.`,
  });
  await saveEcommerceDb(req.url, db);
  return NextResponse.json({ success: true, orderId: order.id, paymentStatus: order.paymentStatus });
}
