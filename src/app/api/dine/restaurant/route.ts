import { NextRequest, NextResponse } from 'next/server';
import { authenticateRestaurant } from '@/lib/dine-auth';
import { DineOrderStatus, loadDineDb, randomId, randomToken, saveDineDb } from '@/lib/dine';

export const runtime = 'edge';

function scoped(db: Awaited<ReturnType<typeof loadDineDb>>, restaurantId: string, session?: any) {
  return {
    restaurant: db.restaurants.find((restaurant) => restaurant.id === restaurantId),
    session,
    categories: db.categories.filter((category) => category.restaurant_id === restaurantId).sort((a, b) => a.sort_order - b.sort_order),
    items: db.items.filter((item) => item.restaurant_id === restaurantId).sort((a, b) => a.sort_order - b.sort_order),
    tables: db.tables.filter((table) => table.restaurant_id === restaurantId),
    orders: db.orders.filter((order) => order.restaurant_id === restaurantId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  };
}

export async function GET(req: NextRequest) {
  const session = await authenticateRestaurant(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await loadDineDb(req.url);
  return NextResponse.json(scoped(db, session.restaurant_id, session));
}

export async function POST(req: NextRequest) {
  const session = await authenticateRestaurant(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const db = await loadDineDb(req.url);
  const restaurantId = session.restaurant_id;
  const now = new Date().toISOString();

  if (body.action === 'save_category') {
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    if (body.id) {
      db.categories = db.categories.map((category) =>
        category.id === body.id && category.restaurant_id === restaurantId
          ? {
              ...category,
              name,
              active: body.active ?? category.active,
              sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : category.sort_order,
            }
          : category
      );
    } else {
      const sortOrder = db.categories.filter((category) => category.restaurant_id === restaurantId).length + 1;
      db.categories.push({ id: randomId('CAT'), restaurant_id: restaurantId, name, sort_order: sortOrder, active: true });
    }
  } else if (body.action === 'delete_category') {
    const category = db.categories.find((candidate) => candidate.id === body.category_id && candidate.restaurant_id === restaurantId);
    if (!category) return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    db.categories = db.categories.map((candidate) => candidate.id === category.id ? { ...candidate, active: false } : candidate);
    db.items = db.items.map((item) =>
      item.restaurant_id === restaurantId && item.category_id === category.id ? { ...item, active: false, available: false } : item
    );
  } else if (body.action === 'save_item') {
    const category = db.categories.find((candidate) => candidate.id === body.category_id && candidate.restaurant_id === restaurantId);
    if (!category) return NextResponse.json({ error: 'Valid category is required.' }, { status: 400 });
    const name = String(body.name || '').trim();
    const price = Number(body.price);
    if (!name || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Item name and valid price are required.' }, { status: 400 });
    }
    if (body.id) {
      db.items = db.items.map((item) =>
        item.id === body.id && item.restaurant_id === restaurantId
          ? {
              ...item,
              category_id: category.id,
              name,
              description: String(body.description || ''),
              price,
              image: body.image !== undefined ? String(body.image || '') : item.image,
              available: body.available ?? item.available,
              active: body.active ?? item.active,
              sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : item.sort_order,
            }
          : item
      );
    } else {
      const sortOrder = db.items.filter((item) => item.restaurant_id === restaurantId && item.category_id === category.id).length + 1;
      db.items.push({
        id: randomId('ITEM'),
        restaurant_id: restaurantId,
        category_id: category.id,
        name,
        description: String(body.description || ''),
        price,
        image: String(body.image || ''),
        available: body.available ?? true,
        active: body.active ?? true,
        sort_order: sortOrder,
      });
    }
  } else if (body.action === 'toggle_item') {
    db.items = db.items.map((item) =>
      item.id === body.item_id && item.restaurant_id === restaurantId
        ? { ...item, available: !!body.available }
        : item
    );
  } else if (body.action === 'delete_item') {
    db.items = db.items.map((item) =>
      item.id === body.item_id && item.restaurant_id === restaurantId ? { ...item, active: false, available: false } : item
    );
  } else if (body.action === 'save_table') {
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Table name is required.' }, { status: 400 });
    if (body.id) {
      db.tables = db.tables.map((table) =>
        table.id === body.id && table.restaurant_id === restaurantId
          ? { ...table, name, active: body.active ?? table.active }
          : table
      );
    } else {
      db.tables.push({ id: randomId('TBL'), restaurant_id: restaurantId, name, token: randomToken(10), active: true, stand_status: 'NOT_PREPARED', created_at: now });
    }
  } else if (body.action === 'delete_table') {
    const table = db.tables.find((candidate) => candidate.id === body.table_id && candidate.restaurant_id === restaurantId);
    if (!table) return NextResponse.json({ error: 'Table not found.' }, { status: 404 });
    const hasOrders = db.orders.some((order) => order.restaurant_id === restaurantId && order.table_id === table.id);
    if (hasOrders) {
      db.tables = db.tables.map((candidate) => candidate.id === table.id ? { ...candidate, active: false } : candidate);
    } else {
      db.tables = db.tables.filter((candidate) => candidate.id !== table.id);
    }
  } else if (body.action === 'update_order_status') {
    const transitions: Record<DineOrderStatus, DineOrderStatus[]> = {
      PENDING_CONFIRMATION: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'REJECTED', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      REJECTED: [],
      CANCELLED: [],
    };
    const order = db.orders.find((candidate) => candidate.id === body.order_id && candidate.restaurant_id === restaurantId);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (!transitions[order.status]?.includes(body.status)) {
      return NextResponse.json({ error: 'This order cannot move to that status.' }, { status: 400 });
    }
    db.orders = db.orders.map((order) =>
      order.id === body.order_id && order.restaurant_id === restaurantId
        ? { ...order, status: body.status, updated_at: now }
        : order
    );
  } else if (body.action === 'update_settings') {
    db.restaurants = db.restaurants.map((restaurant) =>
      restaurant.id === restaurantId
        ? {
            ...restaurant,
            name: String(body.name || restaurant.name).trim(),
            location: String(body.location || restaurant.location).trim(),
            contact_person: String(body.contact_person || restaurant.contact_person).trim(),
            phone: String(body.phone || restaurant.phone).trim(),
            whatsapp: String(body.whatsapp || restaurant.whatsapp).trim(),
            email: String(body.email || restaurant.email).trim(),
            logo: body.logo ?? restaurant.logo,
            payment_preference: body.payment_preference || restaurant.payment_preference,
          }
        : restaurant
    );
  } else {
    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  }

  await saveDineDb(req.url, db);
  return NextResponse.json({ success: true, ...scoped(db, restaurantId, session) });
}
