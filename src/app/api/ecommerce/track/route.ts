import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb } from '@/lib/ecommerce/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId')?.trim().toUpperCase();
    const phone = url.searchParams.get('phone')?.trim().replace(/[\s+-]/g, '').slice(-10);
    const token = url.searchParams.get('token')?.trim();

    if (!orderId || (!phone && !token)) {
      return NextResponse.json({ error: 'Order ID and phone number are required.' }, { status: 400 });
    }

    const db = await loadEcommerceDb(req.url);
    const order = db.orders.find((o) => o.id.toUpperCase() === orderId);

    if (!order) {
      return NextResponse.json({ error: 'No order found with this Order ID.' }, { status: 404 });
    }

    const phoneMatches = Boolean(phone && order.customer.phone.replace(/[\s+-]/g, '').slice(-10) === phone);
    const tokenMatches = Boolean(token && order.trackingToken && token === order.trackingToken);
    if (!phoneMatches && !tokenMatches) {
      return NextResponse.json({ error: 'Phone number does not match order record.' }, { status: 403 });
    }

    // Filter timeline to only customer-facing milestone events
    const customerTimeline = order.timeline
      .filter((t) => t.source !== 'ADMIN' || !t.notes?.toLowerCase().includes('supplier'))
      .map((t) => ({
        event: t.event,
        timestamp: t.timestamp,
        notes: t.notes,
      }));

    // Public sanitized order response
    const trackingResponse = {
      orderId: order.id,
      createdAt: order.createdAt,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      customerName: order.customer.name,
      shippingCity: order.shippingAddress.city,
      shippingState: order.shippingAddress.state,
      total: order.total,
      items: order.items.map((item) => ({
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        image: item.image,
      })),
      shipment: order.shipment ? {
        courier: order.shipment.courier,
        trackingNumber: order.shipment.trackingNumber,
        trackingUrl: order.shipment.trackingUrl,
        shipmentStatus: order.shipment.shipmentStatus,
        shippedAt: order.shipment.shippedAt,
        deliveredAt: order.shipment.deliveredAt,
      } : null,
      timeline: customerTimeline,
    };

    return NextResponse.json({ order: trackingResponse });
  } catch (error: any) {
    console.error('Tracking query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
