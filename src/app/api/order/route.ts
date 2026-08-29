import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export const runtime = 'edge';

// Helper to authenticate admin sessions
async function authenticateAdmin(req: NextRequest): Promise<boolean> {
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

// GET: List all orders/inquiries (Admin only)
export async function GET(req: NextRequest) {
  const isAuthed = await authenticateAdmin(req);
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

  // 2. Fetch from local JSON file dev-db API in development mode
  if (process.env.NODE_ENV === 'development') {
    try {
      const devDbUrl = new URL('/api/dev-db', req.url).toString();
      const res = await fetch(devDbUrl);
      if (res.ok) {
        const fileOrders = await res.json();
        if (Array.isArray(fileOrders)) {
          // Merge only unique IDs
          const merged = [...orders];
          fileOrders.forEach((fo: any) => {
            if (!merged.some((o) => o.order_id === fo.order_id)) {
              merged.push(fo);
            }
          });
          orders = merged;
        }
      }
    } catch (err) {
      console.error('Failed to read dev orders database via GET /api/dev-db:', err);
    }
  }

  // Sort orders by created_at date descending
  orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(orders);
}

// POST: Handles Admin Actions (Update/Delete) OR Customer Order Submissions & Contact Inquiries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, order_id, statusUpdates } = body;

    // ─── ADMIN ACTIONS ROUTING ───────────────────────────────────────────────
    if (action === 'update' || action === 'delete') {
      const isAuthed = await authenticateAdmin(req);
      if (!isAuthed) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!order_id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
      }

      // 1. Update in Cloudflare KV if bound
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
        }
      } catch (kvError) {
        console.warn('KV update failed in POST orders admin action:', kvError);
      }

      // 2. Update in local JSON file in development mode
      if (process.env.NODE_ENV === 'development') {
        try {
          const devDbUrl = new URL('/api/dev-db', req.url).toString();
          await fetch(devDbUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, order_id, statusUpdates })
          });
        } catch (err) {
          console.error('Failed to update dev orders file via POST /api/dev-db:', err);
        }
      }

      return NextResponse.json({ success: true });
    }

    // ─── PUBLIC CUSTOMER FORM SUBMISSIONS ───────────────────────────────────
    const {
      order_type = 'memories', // 'memories' | 'digital_product' | 'service' | 'general_inquiry'
      product_id,
      memory_type,
      size,
      quantity = 1,
      google_photos_url,
      title,
      location,
      date,
      caption,
      design_notes,
      customer_name,
      customer_email,
      customer_phone,
      address_line,
      city,
      state,
      pincode,
      country,
      main_photo,
      additional_photos,
      
      // Service fields
      instagram_page,
      platform_preference,
      needs_whatsapp,
      needs_payment,
      needs_cms,
      needs_notifications,
      audit_url,
      hosting_provider,
      compliance_needs,
      main_concerns,
      pipeline_platform,
      agent_needs_support,
      agent_needs_orders,
      agent_needs_emails,
      agent_llm_vendor,

      // General Contact Inquiry specific fields
      message,
      company,
      phone
    } = body;

    // A. Format General Inquiry as an Order schema entry
    if (order_type === 'general_inquiry') {
      if (!customer_name || !customer_email || !message) {
        return NextResponse.json(
          { error: 'Name, email, and message are required.' },
          { status: 400 }
        );
      }

      const inquiryId = `FN-INQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const inquiryData = {
        order_id: inquiryId,
        order_type: 'general_inquiry',
        product_id: 'general',
        created_at: new Date().toISOString(),
        customer: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone || phone || 'N/A',
          address: null
        },
        company: company || 'N/A',
        design_notes: message,
        payment: {
          status: 'N/A',
          amount: 'N/A',
          method: 'N/A',
          reference: ''
        },
        production: {
          design_status: 'NEW',
          print_status: 'N/A',
          nfc_status: 'N/A',
          nfc_test_status: 'N/A',
          shipping_status: 'N/A'
        }
      };

      // KV Save
      try {
        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        const context = getRequestContext();
        const env = context?.env;
        if (env && env.FEELSNEAT_CMS_KV) {
          await env.FEELSNEAT_CMS_KV.put(`order:${inquiryId}`, JSON.stringify(inquiryData));
        }
      } catch (kvError) {
        console.warn('KV context write skipped in contact API:', kvError);
      }

      // Dev file DB Save
      if (process.env.NODE_ENV === 'development') {
        try {
          const devDbUrl = new URL('/api/dev-db', req.url).toString();
          await fetch(devDbUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_order', orderData: inquiryData })
          });
        } catch (err) {
          console.error('Failed to save general inquiry via POST /api/dev-db:', err);
        }
      }

      return NextResponse.json(
        { success: true, message: 'Message received! We will get back to you shortly.' },
        { status: 200 }
      );
    }

    // B. Format Product / Service submissions
    if (!customer_name || !customer_email || !customer_phone) {
      return NextResponse.json(
        { error: 'Customer contact details (name, email, and phone) are required.' },
        { status: 400 }
      );
    }

    if (order_type === 'memories') {
      if (!memory_type || !size || !quantity || !google_photos_url || !main_photo) {
        return NextResponse.json(
          { error: 'Missing required configuration selections (Memory type, size, quantity, shared album link, and canvas photo are required).' },
          { status: 400 }
        );
      }

      if (!address_line || !city || !state || !pincode) {
        return NextResponse.json(
          { error: 'Customer contact information and complete shipping address details are required.' },
          { status: 400 }
        );
      }

      const photosUrlRegex = /^(https?:\/\/)?(www\.)?(photos\.app\.goo\.gl|photos\.google\.com)\/.+$/;
      if (!photosUrlRegex.test(google_photos_url)) {
        return NextResponse.json(
          { error: 'Invalid Google Photos shared album URL format.' },
          { status: 400 }
        );
      }
    } else if (order_type === 'tap_tiles') {
      if (!memory_type || !size || !quantity || !google_photos_url || !main_photo) {
        return NextResponse.json(
          { error: 'Missing required configuration selections (Style, format format, quantity, NFC link destination, and artwork photo are required).' },
          { status: 400 }
        );
      }

      if (!address_line || !city || !state || !pincode) {
        return NextResponse.json(
          { error: 'Customer contact information and complete shipping address details are required.' },
          { status: 400 }
        );
      }
    } else if (order_type === 'service') {
      if (!product_id) {
        return NextResponse.json(
          { error: 'Service identifier is required.' },
          { status: 400 }
        );
      }
      if (product_id === 'website-development' && !instagram_page) {
        return NextResponse.json(
          { error: 'Instagram Page link / Catalog URL is required for Social Media-to-Store Development services.' },
          { status: 400 }
        );
      }
      if (product_id === 'security-review' && (!audit_url || !hosting_provider)) {
        return NextResponse.json(
          { error: 'Website environment URL and hosting provider details are required for security review audits.' },
          { status: 400 }
        );
      }
      if (product_id === 'ai-integration' && !pipeline_platform) {
        return NextResponse.json(
          { error: 'Order/Purchase platform details are required for AI Agentic integration.' },
          { status: 400 }
        );
      }
    } else {
      if (!product_id) {
        return NextResponse.json(
          { error: 'Product identifier is required.' },
          { status: 400 }
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[6-9]\d{9}$|^[+]\d{1,4}\d{9,10}$/;
    if (!phoneRegex.test(customer_phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format.' },
        { status: 400 }
      );
    }

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = order_type === 'memories' ? 'FN-MEM' : order_type === 'tap_tiles' ? 'FN-TAP' : order_type === 'service' ? 'FN-SRV' : 'FN-DIG';
    const orderId = `${prefix}-${orderNum}`;

    const orderData = {
      order_id: orderId,
      order_type,
      product_id: product_id || null,
      created_at: new Date().toISOString(),
      customer: {
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
        address: (order_type === 'memories' || order_type === 'tap_tiles') ? {
          line: address_line,
          city,
          state,
          pincode,
          country,
        } : null,
      },
      product: (order_type === 'memories' || order_type === 'tap_tiles') ? {
        memory_type,
        size,
        quantity: Number(quantity),
      } : {
        quantity: Number(quantity),
      },
      photos: (order_type === 'memories' || order_type === 'tap_tiles') ? {
        main_photo,
        additional_photos: Array.isArray(additional_photos) ? additional_photos : [],
      } : null,
      memory_details: {
        title: title || '',
        location: location || '',
        date: date || '',
        caption: caption || '',
        design_notes: design_notes || '',
      },
      digital_memory: (order_type === 'memories' || order_type === 'tap_tiles') ? {
        google_photos_url,
      } : null,
      service_details: order_type === 'service' ? {
        instagram_page: instagram_page || null,
        platform_preference: platform_preference || null,
        needs_whatsapp: !!needs_whatsapp,
        needs_payment: !!needs_payment,
        needs_cms: !!needs_cms,
        needs_notifications: !!needs_notifications,
        audit_url: audit_url || null,
        hosting_provider: hosting_provider || null,
        compliance_needs: compliance_needs || null,
        main_concerns: main_concerns || null,
        pipeline_platform: pipeline_platform || null,
        agent_needs_support: !!agent_needs_support,
        agent_needs_orders: !!agent_needs_orders,
        agent_needs_emails: !!agent_needs_emails,
        agent_llm_vendor: agent_llm_vendor || null,
      } : null,
      payment: {
        status: 'AWAITING_PAYMENT',
        amount: 'TBD',
        method: 'UPI/WhatsApp Manual',
        reference: '',
      },
      production: {
        design_status: 'NEW',
        print_status: (order_type === 'memories' || order_type === 'tap_tiles') ? 'NEW' : 'N/A',
        nfc_status: (order_type === 'memories' || order_type === 'tap_tiles') ? 'NEW' : 'N/A',
        nfc_test_status: (order_type === 'memories' || order_type === 'tap_tiles') ? 'NEW' : 'N/A',
        shipping_status: (order_type === 'memories' || order_type === 'tap_tiles') ? 'NEW' : 'N/A',
      },
    };

    // KV Save
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const context = getRequestContext();
      const env = context?.env;
      if (env && env.FEELSNEAT_CMS_KV) {
        await env.FEELSNEAT_CMS_KV.put(`order:${orderId}`, JSON.stringify(orderData));
      }
    } catch (kvError) {
      console.warn('Failed to resolve Cloudflare KV for order:', kvError);
    }

    // Dev file DB Save
    if (process.env.NODE_ENV === 'development') {
      try {
        const devDbUrl = new URL('/api/dev-db', req.url).toString();
        await fetch(devDbUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save_order', orderData })
        });
      } catch (err) {
        console.error('Failed to save order via POST /api/dev-db:', err);
      }
    }

    return NextResponse.json(
      { success: true, orderId: orderId, message: 'Custom order received successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Order submission route error:', error);
    return NextResponse.json(
      { error: 'An unexpected database error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
