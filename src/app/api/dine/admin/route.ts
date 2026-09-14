import { NextRequest, NextResponse } from 'next/server';
import { authenticateFeelsNeatAdmin } from '@/lib/dine-auth';
import { DineDb, DineEnquiryStatus, hashPassword, loadDineDb, randomId, randomToken, saveDineDb, slugify } from '@/lib/dine';

export const runtime = 'edge';

function sanitizeNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function nextOrderNumber(db: DineDb, restaurantId: string) {
  const orders = db.orders.filter((order) => order.restaurant_id === restaurantId);
  return orders.reduce((max, order) => Math.max(max, order.order_number), 1000) + 1;
}

export async function GET(req: NextRequest) {
  const admin = await authenticateFeelsNeatAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await loadDineDb(req.url);
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  const admin = await authenticateFeelsNeatAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const db = await loadDineDb(req.url);
  const now = new Date().toISOString();

  if (body.action === 'update_enquiry_status') {
    const status = body.status as DineEnquiryStatus;
    db.enquiries = db.enquiries.map((enquiry) =>
      enquiry.enquiry_id === body.enquiry_id ? { ...enquiry, status, updated_at: now } : enquiry
    );
    await saveDineDb(req.url, db);
    return NextResponse.json({ success: true });
  }

  if (body.action === 'create_restaurant') {
    const source = body.enquiry_id ? db.enquiries.find((enquiry) => enquiry.enquiry_id === body.enquiry_id) : null;
    const name = String(body.restaurant_name || source?.restaurant_name || '').trim();
    if (!name) return NextResponse.json({ error: 'Restaurant name is required.' }, { status: 400 });

    let slug = slugify(body.slug || name);
    if (!slug) return NextResponse.json({ error: 'Valid restaurant slug is required.' }, { status: 400 });
    let suffix = 2;
    const baseSlug = slug;
    while (db.restaurants.some((restaurant) => restaurant.slug === slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const restaurantId = randomId('REST', 8);
    const userId = randomId('RUSER', 8);
    const tempPassword = randomToken(10);
    const tableCount = Math.max(1, sanitizeNumber(body.table_count ?? source?.table_count, 1));
    const subscriptionStart = body.subscription_start_date || now;
    const expiry = body.subscription_expiry_date || (() => {
      const d = new Date(subscriptionStart);
      d.setMonth(d.getMonth() + 1);
      return d.toISOString();
    })();

    const restaurant = {
      id: restaurantId,
      name,
      slug,
      location: String(body.location || source?.location || '').trim(),
      contact_person: String(body.contact_person || source?.contact_person || '').trim(),
      phone: String(body.phone || source?.phone || '').trim(),
      whatsapp: String(body.whatsapp || source?.whatsapp || '').trim(),
      email: String(body.email || source?.email || '').trim(),
      logo: body.logo || '',
      status: 'ACTIVE' as const,
      subscription_status: (body.subscription_status || 'PENDING') as 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'SUSPENDED',
      subscription_start_date: subscriptionStart,
      subscription_expiry_date: expiry,
      payment_preference: body.payment_preference || source?.payment_preference || 'pay_at_restaurant',
      created_at: now,
      source_enquiry_id: source?.enquiry_id,
    };

    const user = {
      id: userId,
      restaurant_id: restaurantId,
      name: restaurant.contact_person || `${name} Staff`,
      email: restaurant.email,
      phone: restaurant.phone,
      password_hash: await hashPassword(String(body.password || tempPassword)),
      role: 'RESTAURANT_USER' as const,
      status: 'ACTIVE' as const,
      created_at: now,
    };

    const starterCat = { id: randomId('CAT'), restaurant_id: restaurantId, name: 'Starters', sort_order: 1, active: true };
    const mainCat = { id: randomId('CAT'), restaurant_id: restaurantId, name: 'Main Course', sort_order: 2, active: true };
    const defaultItems = [
      { id: randomId('ITEM'), restaurant_id: restaurantId, category_id: starterCat.id, name: 'Chicken 65', description: '', price: 180, available: true, active: true, sort_order: 1 },
      { id: randomId('ITEM'), restaurant_id: restaurantId, category_id: starterCat.id, name: 'Paneer Tikka', description: '', price: 160, available: true, active: true, sort_order: 2 },
      { id: randomId('ITEM'), restaurant_id: restaurantId, category_id: mainCat.id, name: 'Chicken Biryani', description: '', price: 220, available: true, active: true, sort_order: 1 },
      { id: randomId('ITEM'), restaurant_id: restaurantId, category_id: mainCat.id, name: 'Veg Biryani', description: '', price: 180, available: true, active: true, sort_order: 2 },
    ];
    const tables = Array.from({ length: tableCount }).map((_, idx) => ({
      id: randomId('TBL'),
      restaurant_id: restaurantId,
      name: body.table_naming === 'custom' ? `Table ${idx + 1}` : `Table ${String(idx + 1).padStart(2, '0')}`,
      token: randomToken(10),
      active: true,
      stand_status: 'NOT_PREPARED' as const,
      created_at: now,
    }));

    db.restaurants.unshift(restaurant);
    db.users.unshift(user);
    db.categories.push(starterCat, mainCat);
    db.items.push(...defaultItems);
    db.tables.push(...tables);
    if (source) {
      db.enquiries = db.enquiries.map((enquiry) =>
        enquiry.enquiry_id === source.enquiry_id ? { ...enquiry, status: 'ONBOARDING', updated_at: now } : enquiry
      );
    }

    await saveDineDb(req.url, db);
    return NextResponse.json({ success: true, restaurant, user: { ...user, temp_password: body.password || tempPassword }, tables, next_order_number: nextOrderNumber(db, restaurantId) });
  }

  if (body.action === 'update_restaurant') {
    db.restaurants = db.restaurants.map((restaurant) =>
      restaurant.id === body.restaurant_id
        ? {
            ...restaurant,
            name: String(body.name || restaurant.name).trim(),
            location: String(body.location || restaurant.location).trim(),
            contact_person: String(body.contact_person || restaurant.contact_person).trim(),
            phone: String(body.phone || restaurant.phone).trim(),
            whatsapp: String(body.whatsapp || restaurant.whatsapp).trim(),
            email: String(body.email || restaurant.email).trim(),
            payment_preference: body.payment_preference || restaurant.payment_preference,
            status: body.status || restaurant.status,
            subscription_status: body.subscription_status || restaurant.subscription_status,
            subscription_start_date: body.subscription_start_date ?? restaurant.subscription_start_date,
            subscription_expiry_date: body.subscription_expiry_date ?? restaurant.subscription_expiry_date,
          }
        : restaurant
    );
    await saveDineDb(req.url, db);
    return NextResponse.json({ success: true });
  }

  if (body.action === 'reset_restaurant_login') {
    const restaurant = db.restaurants.find((candidate) => candidate.id === body.restaurant_id);
    if (!restaurant) return NextResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    const tempPassword = randomToken(12);
    const passwordHash = await hashPassword(String(body.password || tempPassword));
    let user = db.users.find((candidate) => candidate.restaurant_id === restaurant.id);
    if (user) {
      db.users = db.users.map((candidate) =>
        candidate.id === user!.id
          ? {
              ...candidate,
              name: restaurant.contact_person || candidate.name,
              email: String(body.email || restaurant.email || candidate.email).trim(),
              phone: restaurant.phone || candidate.phone,
              password_hash: passwordHash,
              status: 'ACTIVE',
            }
          : candidate
      );
      user = db.users.find((candidate) => candidate.id === user!.id);
    } else {
      user = {
        id: randomId('RUSER', 8),
        restaurant_id: restaurant.id,
        name: restaurant.contact_person || `${restaurant.name} Staff`,
        email: String(body.email || restaurant.email).trim(),
        phone: restaurant.phone,
        password_hash: passwordHash,
        role: 'RESTAURANT_USER',
        status: 'ACTIVE',
        created_at: now,
      };
      db.users.unshift(user);
    }
    await saveDineDb(req.url, db);
    return NextResponse.json({
      success: true,
      user: user ? { id: user.id, email: user.email, temp_password: body.password || tempPassword } : null,
    });
  }

  if (body.action === 'update_table_stand_status') {
    const allowed = ['NOT_PREPARED', 'PREPARED', 'DELIVERED', 'ACTIVE'];
    if (!allowed.includes(body.stand_status)) {
      return NextResponse.json({ error: 'Invalid table stand status.' }, { status: 400 });
    }
    db.tables = db.tables.map((table) =>
      table.id === body.table_id && table.restaurant_id === body.restaurant_id
        ? { ...table, stand_status: body.stand_status }
        : table
    );
    await saveDineDb(req.url, db);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
