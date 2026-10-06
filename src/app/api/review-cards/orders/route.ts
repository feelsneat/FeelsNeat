import { NextRequest, NextResponse } from 'next/server';
import { saveReviewCardOrder } from '@/lib/review-cards';
import type { ReviewCardMaterial, ReviewCardOrder } from '@/lib/review-card-types';
import { isValidGoogleReviewUrl } from '@/lib/review-card-validation';
import { createReviewCardStickerSvg } from '@/lib/review-card-sticker';
import { detectImageMimeType, getDigitalFileBucket, imageBytesToBase64 } from '@/lib/ecommerce/digital-file-storage';

export const runtime = 'edge';

function sanitizeText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    let logoFile: File | null = null;
    if (/multipart\/form-data/i.test(req.headers.get('content-type') || '')) {
      const formData = await req.formData();
      const payload = formData.get('payload');
      if (typeof payload !== 'string') {
        return NextResponse.json({ error: 'Order details are missing from the submission.' }, { status: 400 });
      }
      body = JSON.parse(payload);
      const uploadedLogo = formData.get('logo_file');
      logoFile = typeof File !== 'undefined' && uploadedLogo instanceof File ? uploadedLogo : null;
    } else {
      body = await req.json();
    }
    const businessName = sanitizeText(body.businessName, 100);
    const googleReviewUrl = sanitizeText(body.googleReviewUrl, 2048);
    const customerName = sanitizeText(body.customerName, 100);
    const phone = sanitizeText(body.phone, 30);
    const whatsapp = sanitizeText(body.whatsapp || body.phone, 30);
    const email = sanitizeText(body.email, 254);
    const deliveryAddress = sanitizeText(body.deliveryAddress, 1200);
    const stickerText = sanitizeText(body.stickerText || 'Review us on Google', 80);
    const notes = sanitizeText(body.notes, 1000);
    const quantity = Number(body.quantity);
    const material = body.material as ReviewCardMaterial;
    let logoDataUrl = body.logoDataUrl === undefined ? '' : body.logoDataUrl;

    if (!businessName || !customerName || !phone || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Business name, contact name, phone number, and delivery address are required.' },
        { status: 400 }
      );
    }
    if (!isValidGoogleReviewUrl(googleReviewUrl)) {
      return NextResponse.json(
        { error: 'Enter a valid HTTPS Google review link, such as a g.page or Google Maps review link.' },
        { status: 400 }
      );
    }
    try {
      createReviewCardStickerSvg(googleReviewUrl, businessName, stickerText, material);
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Use a shorter Google review link for a scannable sticker.',
      }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      return NextResponse.json({ error: 'Order quantity must be between 1 and 500.' }, { status: 400 });
    }
    if (material !== 'WHITE_PAPER' && material !== 'TRANSPARENT') {
      return NextResponse.json({ error: 'Choose paper or transparent sticker material.' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (!/^[+\d\s()-]{8,30}$/.test(phone) || !/^[+\d\s()-]{8,30}$/.test(whatsapp)) {
      return NextResponse.json({ error: 'Enter valid phone and WhatsApp numbers.' }, { status: 400 });
    }
    if (
      typeof logoDataUrl !== 'string' ||
      (logoDataUrl !== '' &&
        (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(logoDataUrl) ||
          logoDataUrl.length > 400_000))
    ) {
      return NextResponse.json({ error: 'Shop logo must be a small PNG image.' }, { status: 400 });
    }
    if (logoFile && (logoFile.size < 1 || logoFile.size > 250_000)) {
      return NextResponse.json({ error: 'Shop logo must be a PNG smaller than 250 KB.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = `FNRC-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    let logoReference: string | undefined;
    if (logoFile) {
      const bytes = new Uint8Array(await logoFile.arrayBuffer());
      if (logoFile.type !== 'image/png' || detectImageMimeType(bytes) !== 'image/png') {
        return NextResponse.json({ error: 'Shop logo must contain a valid PNG image.' }, { status: 400 });
      }
      const bucket = await getDigitalFileBucket();
      if (bucket) {
        const key = `review-card-logos/${id}/${crypto.randomUUID()}`;
        await bucket.put(key, bytes, { httpMetadata: { contentType: 'image/png' } });
        logoReference = `r2://${key}`;
      } else if (process.env.NODE_ENV === 'development') {
        logoDataUrl = `data:image/png;base64,${imageBytesToBase64(bytes)}`;
      } else {
        return NextResponse.json(
          { error: 'Logo storage is not configured. Bind FEELSNEAT_DIGITAL_FILES in Cloudflare.' },
          { status: 503 }
        );
      }
    }
    const order: ReviewCardOrder = {
      id,
      createdAt: now,
      updatedAt: now,
      status: 'NEW',
      source: 'ONLINE',
      businessName,
      googleReviewUrl,
      quantity,
      material,
      stickerText,
      logoDataUrl,
      logoReference,
      customerName,
      phone,
      whatsapp,
      email,
      deliveryAddress,
      notes,
      adminNotes: '',
      approvedStickerSvg: '',
      approvedStickerAt: '',
      printRuns: [],
    };

    await saveReviewCardOrder(req.url, order);
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('[Review Cards] Order request failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not submit your order request.' }, { status: 500 });
  }
}
