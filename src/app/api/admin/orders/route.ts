import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export const runtime = 'edge';

// Global Symbol to persist local orders in-memory for the dev server lifecycle
const ordersSymbol = Symbol.for('feelsneat.orders');
if (process.env.NODE_ENV === 'development' && !(globalThis as any)[ordersSymbol]) {
  (globalThis as any)[ordersSymbol] = [
    // Pre-populate mock orders for development testing
    {
      order_id: 'FN-MEM-9921',
      order_type: 'memories',
      product_id: null,
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      customer: {
        name: 'Aravind Sharma',
        email: 'aravind@gmail.com',
        phone: '9845012345',
        address: {
          line: 'Flat 402, Block A, Prestige Heights',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        }
      },
      product: {
        memory_type: 'travel',
        size: 'standard',
        quantity: 2
      },
      photos: {
        main_photo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600',
        additional_photos: []
      },
      memory_details: {
        title: 'Manali Honeymoon',
        location: 'Manali, HP',
        date: 'December 2025',
        caption: 'The cold mountains and warm hot-chocolate cups',
        design_notes: 'Please center the snow mountain landscape nicely.'
      },
      digital_memory: {
        google_photos_url: 'https://photos.app.goo.gl/manali-trip-honeymoon-link'
      },
      payment: {
        status: 'AWAITING_PAYMENT',
        amount: '₹3,400',
        method: 'UPI/WhatsApp Manual',
        reference: ''
      },
      production: {
        design_status: 'NEW',
        print_status: 'NEW',
        nfc_status: 'NEW',
        nfc_test_status: 'NEW',
        shipping_status: 'NEW'
      }
    },
    {
      order_id: 'FN-DIG-7811',
      order_type: 'digital_product',
      product_id: 'star-interview',
      created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      customer: {
        name: 'Meera Patel',
        email: 'meera.patel@yahoo.com',
        phone: '9920134567',
        address: null
      },
      product: {
        quantity: 1
      },
      payment: {
        status: 'PAID',
        amount: '$19.00',
        method: 'WhatsApp Manual UPI',
        reference: 'UPI-TXN-8829012'
      },
      production: {
        design_status: 'COMPLETED', // Acts as Delivery Sent for templates
        print_status: 'N/A',
        nfc_status: 'N/A',
        nfc_test_status: 'N/A',
        shipping_status: 'N/A'
      }
    },
    {
      order_id: 'FN-SRV-3329',
      order_type: 'service',
      product_id: 'website-development',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      customer: {
        name: 'Rohan Mehta (BakeCraft)',
        email: 'bakecraft.in@gmail.com',
        phone: '9820011223',
        address: null
      },
      product: {
        quantity: 1
      },
      service_details: {
        instagram_page: 'instagram.com/bakecraft_cakes',
        platform_preference: 'Shopify preferred',
        needs_whatsapp: true,
        needs_payment: true,
        needs_cms: true,
        needs_notifications: false
      },
      payment: {
        status: 'AWAITING_PAYMENT',
        amount: 'Custom Quote',
        method: 'UPI/WhatsApp Manual',
        reference: ''
      },
      production: {
        design_status: 'NEW',
        print_status: 'N/A',
        nfc_status: 'N/A',
        nfc_test_status: 'N/A',
        shipping_status: 'N/A'
      }
    }
  ];
}

async function authenticate(req: NextRequest): Promise<boolean> {
  const sessionCookie = req.cookies.get('feelsneat_session');
  if (!sessionCookie || !sessionCookie.value) return false;
  
  const authSecret = process.env.AUTH_SECRET || (
    process.env.NODE_ENV === 'development' 
      ? 'local_dev_secret_key_needs_to_be_long_and_secure_32_chars' 
      : undefined
  );
  if (!authSecret) return false;
  
  const decoded = await verifySession(sessionCookie.value, authSecret);
  return decoded !== null;
}

export async function GET(req: NextRequest) {
  const isAuthed = await authenticate(req);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let orders: any[] = [];

  // 1. Fetch from Cloudflare KV if bound
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;
    if (env && env.FEELSNEAT_CMS_KV) {
      const list = await env.FEELSNEAT_CMS_KV.list({ prefix: 'order:' });
      const fetchPromises = list.keys.map(async (keyObj: any) => {
        const val = await env.FEELSNEAT_CMS_KV.get(keyObj.name);
        return val ? JSON.parse(val) : null;
      });
      const resolved = await Promise.all(fetchPromises);
      orders = resolved.filter(Boolean);
    }
  } catch (e) {
    console.warn('KV context list error in GET admin/orders:', e);
  }

  // 2. Merge/fallback to development session state
  if (process.env.NODE_ENV === 'development') {
    const memoryOrders = (globalThis as any)[ordersSymbol] || [];
    // Merge only unique IDs
    const merged = [...orders];
    memoryOrders.forEach((mo: any) => {
      if (!merged.some((o) => o.order_id === mo.order_id)) {
        merged.push(mo);
      }
    });
    orders = merged;
  }

  // Sort orders by created_at date descending
  orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const isAuthed = await authenticate(req);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, order_id, statusUpdates } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Update order in Cloudflare KV if bound
    let kvUpdated = false;
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const context = getRequestContext();
      const env = context?.env;
      if (env && env.FEELSNEAT_CMS_KV) {
        const key = `order:${order_id}`;
        if (action === 'delete') {
          await env.FEELSNEAT_CMS_KV.delete(key);
        } else {
          const val = await env.FEELSNEAT_CMS_KV.get(key);
          if (val) {
            const parsed = JSON.parse(val);
            const merged = {
              ...parsed,
              payment: { ...parsed.payment, ...(statusUpdates.payment || {}) },
              production: { ...parsed.production, ...(statusUpdates.production || {}) }
            };
            await env.FEELSNEAT_CMS_KV.put(key, JSON.stringify(merged));
          }
        }
        kvUpdated = true;
      }
    } catch (kvError) {
      console.warn('KV update failed in POST admin/orders:', kvError);
    }

    // 2. Update order in session-memory for development fallback
    if (process.env.NODE_ENV === 'development') {
      const memoryOrders = (globalThis as any)[ordersSymbol] || [];
      if (action === 'delete') {
        (globalThis as any)[ordersSymbol] = memoryOrders.filter((o: any) => o.order_id !== order_id);
      } else {
        (globalThis as any)[ordersSymbol] = memoryOrders.map((o: any) => {
          if (o.order_id === order_id) {
            return {
              ...o,
              payment: { ...o.payment, ...(statusUpdates.payment || {}) },
              production: { ...o.production, ...(statusUpdates.production || {}) }
            };
          }
          return o;
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order state' }, { status: 500 });
  }
}
