import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function getDbPath() {
  return path.join(process.cwd(), 'src/lib/orders-db-dev.json');
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
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
    const { action, order_id, orderData, statusUpdates } = body;
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
          return {
            ...o,
            payment: { ...o.payment, ...(statusUpdates.payment || {}) },
            production: { ...o.production, ...(statusUpdates.production || {}) }
          };
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
