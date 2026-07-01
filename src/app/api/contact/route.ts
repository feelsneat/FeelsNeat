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

    // ────────────────────────────────────────────────────────────────────────
    // PREPARED FOR CLOUDFLARE WORKER BINDINGS & ACTIONS
    // ────────────────────────────────────────────────────────────────────────
    // If you add database/KV bindings in wrangler.json, you can access them here:
    //   const { env } = req as any; // Next-on-pages injects cloudflare context
    // 
    // Example: Storing in Cloudflare KV:
    //   await env.CONTACT_KV.put(`msg:${Date.now()}:${email}`, JSON.stringify({ name, message, company, phone }));
    //
    // Example: Sending email via Resend API:
    //   await fetch('https://api.resend.com/emails', {
    //     method: 'POST',
    //     headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ from: 'FeelsNeat Site <hello@feelsneat.com>', to: 'hello@feelsneat.com', subject: 'New Form Submission', html: `<p>${name} sent a message: ${message}<br/>Phone: ${phone || 'N/A'}</p>` })
    //   });
    // ────────────────────────────────────────────────────────────────────────

    console.log('Received contact form submission:', { name, email, message, company, phone });

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
