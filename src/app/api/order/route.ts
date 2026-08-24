import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_type = 'memories', // 'memories' | 'digital_product' | 'service'
      product_id, // e.g. 'ats-resume' or 'digital-engineering'
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
    } = body;

    // 1. Server-Side Validations
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

      // Google Photos Shared URL pattern verification
      const photosUrlRegex = /^(https?:\/\/)?(www\.)?(photos\.app\.goo\.gl|photos\.google\.com)\/.+$/;
      if (!photosUrlRegex.test(google_photos_url)) {
        return NextResponse.json(
          { error: 'Invalid Google Photos shared album URL format.' },
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

    // Email address formatting check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // Phone format verification (matches standard mobile digits)
    const phoneRegex = /^[6-9]\d{9}$|^[+]\d{1,4}\d{9,10}$/;
    if (!phoneRegex.test(customer_phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format.' },
        { status: 400 }
      );
    }

    // 2. Generate Unique Order ID
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = order_type === 'memories' ? 'FN-MEM' : order_type === 'service' ? 'FN-SRV' : 'FN-DIG';
    const orderId = `${prefix}-${orderNum}`;

    // 3. Assemble Internal Order Structure
    const orderData = {
      order_id: orderId,
      order_type,
      product_id: product_id || null,
      created_at: new Date().toISOString(),
      customer: {
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
        address: order_type === 'memories' ? {
          line: address_line,
          city,
          state,
          pincode,
          country,
        } : null,
      },
      product: order_type === 'memories' ? {
        memory_type,
        size,
        quantity: Number(quantity),
      } : {
        quantity: Number(quantity),
      },
      photos: order_type === 'memories' ? {
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
      digital_memory: order_type === 'memories' ? {
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
        print_status: order_type === 'memories' ? 'NEW' : 'N/A',
        nfc_status: order_type === 'memories' ? 'NEW' : 'N/A',
        nfc_test_status: order_type === 'memories' ? 'NEW' : 'N/A',
        shipping_status: order_type === 'memories' ? 'NEW' : 'N/A',
      },
    };

    // 4. Persist in Cloudflare KV (if context is bound)
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const context = getRequestContext();
      const env = context?.env;
      if (env && env.FEELSNEAT_CMS_KV) {
        // Store order JSON document directly in KV (limits allow up to 25MB)
        await env.FEELSNEAT_CMS_KV.put(`order:${orderId}`, JSON.stringify(orderData));
        console.log(`Saved order ${orderId} successfully to Cloudflare KV store.`);
      } else {
        console.warn('FEELSNEAT_CMS_KV binding is not available in request context.');
      }
    } catch (kvError) {
      console.warn('Failed to resolve Cloudflare KV execution context for order:', kvError);
    }

    // Save order in-memory for local development admin session testing
    if (process.env.NODE_ENV === 'development') {
      const ordersSymbol = Symbol.for('feelsneat.orders');
      if (!(globalThis as any)[ordersSymbol]) {
        (globalThis as any)[ordersSymbol] = [];
      }
      (globalThis as any)[ordersSymbol].unshift(orderData);
      console.log(`Saved order ${orderId} successfully in-memory for dev server.`);
    }

    // Always log the details for traceability (excluding very long base64 image strings to keep logs neat)
    const logData = order_type === 'memories' 
      ? { ...orderData, photos: { main_photo: '[Base64 String]', additional_photos: [] } }
      : orderData;
    console.log(`Processed order submission of type ${order_type}:`, logData);

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
