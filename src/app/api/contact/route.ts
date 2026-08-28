import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message, company, phone } = body;

    // Server-side validation
    if (!name || !email || !message) {
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
        name,
        email,
        phone: phone || 'N/A',
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

    // 1. Persist to Cloudflare KV (if context is bound)
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const context = getRequestContext();
      const env = context?.env;
      if (env && env.FEELSNEAT_CMS_KV) {
        await env.FEELSNEAT_CMS_KV.put(`order:${inquiryId}`, JSON.stringify(inquiryData));
        console.log(`Saved general inquiry ${inquiryId} successfully to Cloudflare KV store.`);
      }
    } catch (kvError) {
      console.warn('KV context write skipped in POST contact API:', kvError);
    }

    // 2. Persist to development session state for local testing
    if (process.env.NODE_ENV === 'development') {
      const ordersSymbol = Symbol.for('feelsneat.orders');
      if (!(globalThis as any)[ordersSymbol]) {
        (globalThis as any)[ordersSymbol] = [];
      }
      (globalThis as any)[ordersSymbol].unshift(inquiryData);
      console.log(`Saved general inquiry ${inquiryId} successfully in-memory for dev server.`);
    }

    console.log('Processed contact form submission:', inquiryData);

    // Mock response delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    return NextResponse.json(
      { success: true, message: 'Message received! We will get back to you shortly.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact Form submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
