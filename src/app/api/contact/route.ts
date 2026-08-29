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

    // Forward the general inquiry payload to the unified orders API endpoint
    const orderApiUrl = new URL('/api/order', req.url).toString();
    const response = await fetch(orderApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_type: 'general_inquiry',
        customer_name: name,
        customer_email: email,
        message,
        company,
        customer_phone: phone || ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to forward contact inquiry: ${errorText}`);
    }

    return NextResponse.json(
      { success: true, message: 'Message received! We will get back to you shortly.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact Form submission error forwarding:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
