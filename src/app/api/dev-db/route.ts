import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function getDbPath() {
  return path.join(process.cwd(), 'src/lib/orders-db-dev.json');
}

function getProfilesPath() {
  return path.join(process.cwd(), 'src/lib/profiles-db-dev.json');
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    if (type === 'profiles') {
      const pPath = getProfilesPath();
      if (!fs.existsSync(pPath)) {
        fs.writeFileSync(pPath, '[]', 'utf-8');
      }
      const content = fs.readFileSync(pPath, 'utf-8');
      const profiles = JSON.parse(content);
      return NextResponse.json(profiles);
    }

    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, '[]', 'utf-8');
    }
    const content = fs.readFileSync(dbPath, 'utf-8');
    const orders = JSON.parse(content);
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, order_id, orderData, statusUpdates, profile_id, profileData, status } = body;

    // Handle Profile actions
    if (action === 'save_profile' && profileData) {
      const pPath = getProfilesPath();
      let profiles: any[] = [];
      if (fs.existsSync(pPath)) {
        const content = fs.readFileSync(pPath, 'utf-8');
        profiles = JSON.parse(content);
      }
      // Remove duplicate
      profiles = profiles.filter((p) => p.profile_id !== profileData.profile_id);
      profiles.unshift(profileData);
      fs.writeFileSync(pPath, JSON.stringify(profiles, null, 2), 'utf-8');
      console.log(`[Dev-DB API] Saved pet profile: ${profileData.profile_id}`);
      return NextResponse.json({ success: true, count: profiles.length });
    }

    if (action === 'delete_profile' && profile_id) {
      const pPath = getProfilesPath();
      if (fs.existsSync(pPath)) {
        const content = fs.readFileSync(pPath, 'utf-8');
        let profiles = JSON.parse(content);
        profiles = profiles.filter((p: any) => p.profile_id !== profile_id);
        fs.writeFileSync(pPath, JSON.stringify(profiles, null, 2), 'utf-8');
        console.log(`[Dev-DB API] Deleted pet profile: ${profile_id}`);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'update_profile_status' && profile_id && status) {
      const pPath = getProfilesPath();
      if (fs.existsSync(pPath)) {
        const content = fs.readFileSync(pPath, 'utf-8');
        let profiles = JSON.parse(content);
        profiles = profiles.map((p: any) => {
          if (p.profile_id === profile_id) {
            return { ...p, status, updated_at: new Date().toISOString() };
          }
          return p;
        });
        fs.writeFileSync(pPath, JSON.stringify(profiles, null, 2), 'utf-8');
        console.log(`[Dev-DB API] Updated pet profile status: ${profile_id} -> ${status}`);
      }
      return NextResponse.json({ success: true });
    }

    // Default Order Actions
    const dbPath = getDbPath();
    let orders: any[] = [];
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf-8');
      orders = JSON.parse(content);
    }

    if (action === 'save_order' && orderData) {
      // Remove duplicates if any
      orders = orders.filter((o) => o.order_id !== orderData.order_id);
      orders.unshift(orderData);
      console.log(`[Dev-DB API] Prepended order: ${orderData.order_id}`);
    } else if (action === 'update' && order_id && statusUpdates) {
      orders = orders.map((o) => {
        if (o.order_id === order_id) {
          const updatedOrder = {
            ...o,
            payment: { ...o.payment, ...(statusUpdates.payment || {}) },
            production: { ...o.production, ...(statusUpdates.production || {}) }
          };
          if (statusUpdates.nfc_profile_id) {
            updatedOrder.nfc_profile_id = statusUpdates.nfc_profile_id;
          }
          return updatedOrder;
        }
        return o;
      });
      console.log(`[Dev-DB API] Updated order status for: ${order_id}`);
    } else if (action === 'delete' && order_id) {
      orders = orders.filter((o) => o.order_id !== order_id);
      console.log(`[Dev-DB API] Deleted order: ${order_id}`);
    }

    fs.writeFileSync(dbPath, JSON.stringify(orders, null, 2), 'utf-8');
    return NextResponse.json({ success: true, count: orders.length });
  } catch (error: any) {
    console.error('[Dev-DB API] Write error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
