import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      memory_type,
      size,
      quantity,
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
    } = body;

    // 1. Server-Side Validations
    if (!memory_type || !size || !quantity || !google_photos_url || !main_photo) {
      return NextResponse.json(
        { error: 'Missing required configuration selections (Memory type, size, quantity, shared album link, and canvas photo are required).' },
        { status: 400 }
      );
    }

    if (!customer_name || !customer_email || !customer_phone || !address_line || !city || !state || !pincode) {
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
    // Sequential-style order numbers for MVP
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `FN-MEM-${orderNum}`;

    // 3. Assemble Internal Order Structure
    const orderData = {
      order_id: orderId,
      created_at: new Date().toISOString(),
      customer: {
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
        address: {
          line: address_line,
          city,
          state,
          pincode,
          country,
        },
      },
      product: {
        memory_type,
        size,
        quantity: Number(quantity),
      },
      photos: {
        main_photo, // Base64 string for production print
        additional_photos: Array.isArray(additional_photos) ? additional_photos : [],
      },
      memory_details: {
        title: title || '',
        location: location || '',
        date: date || '',
        caption: caption || '',
        design_notes: design_notes || '',
      },
      digital_memory: {
        google_photos_url,
      },
      payment: {
        status: 'AWAITING_PAYMENT',
        amount: 'TBD',
        method: 'UPI/WhatsApp Manual',
        reference: '',
      },
      production: {
        design_status: 'NEW',
        print_status: 'NEW',
        nfc_status: 'NEW',
        nfc_test_status: 'NEW',
        shipping_status: 'NEW',
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

    // Always log the details for traceability (excluding very long base64 image strings to keep logs neat)
    const logData = { ...orderData, photos: { main_photo: '[Base64 String]', additional_photos: [] } };
    console.log('Processed memories custom order submission:', logData);

    return NextResponse.json(
      { success: true, orderId: orderId, message: 'Custom memory order received successfully.' },
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
