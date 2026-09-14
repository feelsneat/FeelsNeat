import { NextRequest, NextResponse } from 'next/server';
import { DineOrder, loadDineDb, randomId, randomToken, saveDineDb } from '@/lib/dine';

export const runtime = 'edge';

function publicRestaurant(db: Awaited<ReturnType<typeof loadDineDb>>, slug: string) {
  return db.restaurants.find((restaurant) => restaurant.slug === slug && restaurant.status === 'ACTIVE');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const restaurantSlug = url.searchParams.get('restaurantSlug') || '';
  const tableToken = url.searchParams.get('tableToken') || '';
  const orderToken = url.searchParams.get('orderToken');
  const db = await loadDineDb(req.url);
  const restaurant = publicRestaurant(db, restaurantSlug);
  if (!restaurant) return NextResponse.json({ error: 'This restaurant menu is not available right now.' }, { status: 404 });
  if (restaurant.subscription_status === 'EXPIRED' || restaurant.subscription_status === 'SUSPENDED') {
    return NextResponse.json({ error: 'This restaurant menu is temporarily unavailable.' }, { status: 403 });
  }

  if (orderToken) {
    const order = db.orders.find((candidate) =>
      (candidate.access_token || candidate.id) === orderToken && candidate.restaurant_id === restaurant.id
    );
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    const table = db.tables.find((candidate) => candidate.id === order.table_id);
    return NextResponse.json({ order, table });
  }

  const table = tableToken
    ? db.tables.find((candidate) => candidate.restaurant_id === restaurant.id && candidate.token === tableToken && candidate.active)
    : null;
  if (tableToken && !table) return NextResponse.json({ error: 'Table not found.' }, { status: 404 });

  const categories = db.categories
    .filter((category) => category.restaurant_id === restaurant.id && category.active)
    .sort((a, b) => a.sort_order - b.sort_order);
  const items = db.items
    .filter((item) => item.restaurant_id === restaurant.id && item.active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return NextResponse.json({
    restaurant: {
      name: restaurant.name,
      slug: restaurant.slug,
      location: restaurant.location,
      logo: restaurant.logo,
      payment_preference: restaurant.payment_preference,
    },
    table,
    categories,
    items,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await loadDineDb(req.url);
  const restaurant = publicRestaurant(db, String(body.restaurantSlug || ''));
  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found.' }, { status: 404 });

  const table = db.tables.find((candidate) =>
    candidate.restaurant_id === restaurant.id && candidate.token === body.tableToken && candidate.active
  );
  if (!table) return NextResponse.json({ error: 'Invalid table.' }, { status: 400 });

  const requested = Array.isArray(body.items) ? body.items : [];
  if (requested.length === 0) return NextResponse.json({ error: 'Please add at least one item.' }, { status: 400 });

  const orderItems = [];
  for (const requestedItem of requested) {
    const quantity = Math.max(1, Math.min(20, Number(requestedItem.quantity || 1)));
    const item = db.items.find((candidate) =>
      candidate.id === requestedItem.item_id &&
      candidate.restaurant_id === restaurant.id &&
      candidate.active &&
      candidate.available
    );
    if (!item) return NextResponse.json({ error: 'One or more selected items are no longer available.' }, { status: 400 });
    orderItems.push({
      item_id: item.id,
      name: item.name,
      quantity,
      price: item.price,
      line_total: item.price * quantity,
    });
  }

  const now = new Date().toISOString();
  const nextNumber = db.orders
    .filter((order) => order.restaurant_id === restaurant.id)
    .reduce((max, order) => Math.max(max, order.order_number), 1000) + 1;
  const subtotal = orderItems.reduce((sum, item) => sum + item.line_total, 0);
  const order: DineOrder = {
    id: randomId('DORD', 8),
    access_token: randomToken(24),
    restaurant_id: restaurant.id,
    table_id: table.id,
    order_number: nextNumber,
    status: 'PENDING_CONFIRMATION',
    items: orderItems,
    subtotal,
    total: subtotal,
    payment_status: restaurant.payment_preference === 'online_payment' ? 'PENDING' : 'NOT_REQUIRED',
    verification_code: String(Math.floor(1000 + Math.random() * 9000)),
    created_at: now,
    updated_at: now,
  };
  db.orders.unshift(order);
  await saveDineDb(req.url, db);
  return NextResponse.json({ success: true, order: { ...order, access_token: order.access_token }, table });
}
