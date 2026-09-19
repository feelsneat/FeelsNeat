import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';
import { CashfreePaymentProvider } from '@/lib/ecommerce/payments/cashfree';
import { getFulfillmentProvider } from '@/lib/ecommerce/fulfillment/mock';
import { FulfillmentOrder, OrderTimelineEvent } from '@/lib/ecommerce/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const cashfree = new CashfreePaymentProvider();

    // 1. Webhook Signature Verification
    if (cashfree.isConfigured()) {
      const isValid = await cashfree.verifyWebhookSignature(headers, rawBody);
      if (!isValid) {
        console.warn('[Cashfree Webhook] Invalid signature rejected');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    } else {
      console.log('[Cashfree Webhook] In development / mock mode, signature check skipped.');
    }

    // 2. Event Parsing
    const event = cashfree.parseWebhookEvent(rawBody);
    if (!event || !event.orderId) {
      return NextResponse.json({ error: 'Unable to parse webhook order event' }, { status: 400 });
    }

    const db = await loadEcommerceDb(req.url);
    const order = db.orders.find((o) => o.id === event.orderId);

    if (!order) {
      console.warn(`[Cashfree Webhook] Order ${event.orderId} not found in database`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // 3. Idempotency Check: Don't process twice if already paid
    if (order.paymentStatus === 'PAID') {
      console.log(`[Cashfree Webhook] Order ${order.id} is already PAID. Idempotent return.`);
      return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
    }

    // 4. Update Payment Record
    let payment = db.payments.find((p) => p.orderId === order.id);
    if (!payment) {
      payment = {
        id: `PAY-${order.orderNumber}`,
        orderId: order.id,
        provider: 'CASHFREE',
        amount: order.total,
        currency: 'INR',
        paymentMethod: event.paymentMethod || 'ONLINE',
        status: event.paymentStatus,
        createdAt: now,
        updatedAt: now,
      };
      db.payments.unshift(payment);
    }

    payment.status = event.paymentStatus;
    payment.providerPaymentId = event.providerPaymentId || payment.providerPaymentId;
    payment.gatewayResponse = event.rawEvent;
    payment.updatedAt = now;

    if (event.paymentStatus === 'PAID') {
      payment.paidAt = event.eventTime || now;
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.updatedAt = now;

      // Add Payment Confirmed Event to Timeline
      const payEvent: OrderTimelineEvent = {
        id: `evt-${Date.now()}-pay`,
        orderId: order.id,
        event: 'Payment Confirmed',
        timestamp: now,
        source: 'CASHFREE',
        actor: 'Cashfree Webhook',
        notes: `Payment of ₹${event.amount} confirmed. Payment ID: ${event.providerPaymentId || 'N/A'}`,
      };
      order.timeline.push(payEvent);

      // 5. Trigger Fulfillment Order (Idempotent: only if not already created)
      const existingFulfillment = db.fulfillmentOrders.find((f) => f.orderId === order.id);
      if (!existingFulfillment) {
        const fulfillmentId = `FUL-${order.orderNumber}`;
        const supplierId = 'sup-alishipping';
        const fulfillmentProvider = getFulfillmentProvider('ALISHIPPING');

        const fulfillmentItems = order.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          supplierSku: item.supplierSku || item.sku,
          quantity: item.quantity,
          supplierCost: item.supplierCost || 0,
        }));

        const newFulfillment: FulfillmentOrder = {
          id: fulfillmentId,
          orderId: order.id,
          supplierId,
          providerType: 'ALISHIPPING',
          status: 'PENDING',
          items: fulfillmentItems,
          retryCount: 0,
          createdAt: now,
          updatedAt: now,
        };

        // Try creating fulfillment order with provider
        try {
          const result = await fulfillmentProvider.createFulfillmentOrder({
            order,
            items: fulfillmentItems,
          });

          if (result.success) {
            newFulfillment.status = result.status;
            newFulfillment.providerOrderId = result.providerOrderId;
            order.fulfillmentStatus = result.status;
            order.fulfillmentId = fulfillmentId;

            if (result.trackingNumber && result.courier) {
              const shipment = {
                id: `SHP-${order.orderNumber}`,
                fulfillmentOrderId: fulfillmentId,
                orderId: order.id,
                courier: result.courier,
                trackingNumber: result.trackingNumber,
                trackingUrl: result.trackingUrl,
                shipmentStatus: 'IN_TRANSIT',
                shippedAt: now,
                createdAt: now,
                updatedAt: now,
              };
              db.shipments.unshift(shipment);
              order.shipment = shipment;
            }

            order.timeline.push({
              id: `evt-${Date.now()}-ful`,
              orderId: order.id,
              event: 'Fulfillment Order Created',
              timestamp: now,
              source: 'ALISHIPPING',
              actor: 'Fulfillment System',
              notes: `Fulfillment Order ${fulfillmentId} initiated with ${fulfillmentProvider.name}.`,
            });
          } else {
            // Fulfillment failed or provider not connected: keep order PAID & CONFIRMED
            newFulfillment.status = 'FAILED';
            newFulfillment.lastError = result.error || 'Provider rejected request';
            order.fulfillmentStatus = 'FAILED';
            order.fulfillmentId = fulfillmentId;

            order.timeline.push({
              id: `evt-${Date.now()}-ful-err`,
              orderId: order.id,
              event: 'Fulfillment Pending (Manual Attention Required)',
              timestamp: now,
              source: 'SYSTEM',
              actor: 'System',
              notes: `Payment confirmed, but automatic fulfillment requires attention: ${result.error}`,
            });
          }
        } catch (fulErr: any) {
          newFulfillment.status = 'FAILED';
          newFulfillment.lastError = fulErr.message;
          order.fulfillmentStatus = 'FAILED';
          order.fulfillmentId = fulfillmentId;
        }

        db.fulfillmentOrders.unshift(newFulfillment);
        order.fulfillmentDetails = newFulfillment;
      }
    } else if (event.paymentStatus === 'FAILED') {
      order.paymentStatus = 'FAILED';
      order.orderStatus = 'PAYMENT_FAILED';
      order.timeline.push({
        id: `evt-${Date.now()}-fail`,
        orderId: order.id,
        event: 'Payment Failed',
        timestamp: now,
        source: 'CASHFREE',
        actor: 'Cashfree Webhook',
        notes: `Payment failed for order ${order.id}.`,
      });
    }

    await saveEcommerceDb(req.url, db);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    });
  } catch (error: any) {
    console.error('[Cashfree Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
