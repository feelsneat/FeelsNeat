import { NextRequest, NextResponse } from 'next/server';
import { authenticateFeelsNeatAdmin } from '@/lib/dine-auth';
import { createReviewCardStickerSvg } from '@/lib/review-card-sticker';
import { loadReviewCardOrders, loadReviewCardOrdersPage, saveReviewCardOrder } from '@/lib/review-cards';
import { REVIEW_CARD_MATERIALS, REVIEW_CARD_STATUS, type ReviewCardMaterial, type ReviewCardOrder, type ReviewCardPrintRun } from '@/lib/review-card-types';
import { isValidGoogleReviewUrl } from '@/lib/review-card-validation';
import {
  detectImageMimeType,
  getR2Object,
  imageBytesToBase64,
  putR2Object,
} from '@/lib/ecommerce/digital-file-storage';

export const runtime = 'edge';

async function requireAdmin(req: NextRequest) {
  return authenticateFeelsNeatAdmin(req);
}

async function hydrateReviewCardLogo(order: ReviewCardOrder): Promise<ReviewCardOrder> {
  if (!order.logoReference) return order;
  const match = /^r2:\/\/review-card-logos\/([A-Za-z0-9-]{1,64})\/([0-9a-f-]{36}|[0-9a-f]{64})$/i.exec(order.logoReference);
  if (!match) throw new Error(`Review Cards order ${order.id} has an invalid logo reference.`);
  const object = await getR2Object(`review-card-logos/${match[1]}/${match[2]}`);
  if (!object || object.httpMetadata?.contentType !== 'image/png') {
    throw new Error(`Review Cards logo for order ${order.id} could not be loaded.`);
  }
  const bytes = new Uint8Array(await new Response(object.body).arrayBuffer());
  return { ...order, logoDataUrl: `data:image/png;base64,${imageBytesToBase64(bytes)}` };
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const orders = await loadReviewCardOrders(req.url);
    return NextResponse.json({ orders: await Promise.all(orders.map(hydrateReviewCardLogo)) });
  } catch (error) {
    console.error('[Review Cards] Admin order list failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not load Review Cards orders.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    if (body.action === 'migrate_logos_to_r2') {
      const cursor = typeof body.cursor === 'string' ? body.cursor : undefined;
      const page = await loadReviewCardOrdersPage(req.url, cursor, 25);
      let migratedCount = 0;
      for (const order of page.orders) {
        if (order.logoReference || !order.logoDataUrl) continue;
        const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(order.logoDataUrl);
        if (!match) throw new Error(`Review Cards order ${order.id} has an invalid legacy logo.`);
        const binary = atob(match[1]);
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        if (detectImageMimeType(bytes) !== 'image/png' || bytes.byteLength > 250_000) {
          throw new Error(`Review Cards order ${order.id} has an invalid legacy logo.`);
        }
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
        const key = `review-card-logos/${order.id}/${hash}`;
        await putR2Object(key, bytes, 'image/png');
        order.logoReference = `r2://${key}`;
        order.logoDataUrl = '';
        await saveReviewCardOrder(req.url, order);
        migratedCount += 1;
      }
      return NextResponse.json({
        success: true,
        migratedCount,
        complete: page.complete,
        nextCursor: page.nextCursor,
      });
    }
    if (body.action === 'create_walk_in_order') {
      const businessName = typeof body.businessName === 'string' ? body.businessName.trim().slice(0, 100) : '';
      const googleReviewUrl = typeof body.googleReviewUrl === 'string' ? body.googleReviewUrl.trim().slice(0, 2048) : '';
      const customerName = typeof body.customerName === 'string' ? body.customerName.trim().slice(0, 100) : '';
      const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 30) : '';
      const whatsapp = typeof body.whatsapp === 'string' && body.whatsapp.trim()
        ? body.whatsapp.trim().slice(0, 30)
        : phone;
      const quantity = Number(body.quantity);
      const material = body.material as ReviewCardMaterial;
      const stickerText = typeof body.stickerText === 'string' ? body.stickerText.trim().slice(0, 80) : '';
      const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : '';

      if (!businessName || !customerName || !phone || !/^[+\d\s()-]{8,30}$/.test(phone) || !/^[+\d\s()-]{8,30}$/.test(whatsapp)) {
        return NextResponse.json({ error: 'Enter the shop name, contact name, and valid phone and WhatsApp numbers.' }, { status: 400 });
      }
      if (!isValidGoogleReviewUrl(googleReviewUrl)) {
        return NextResponse.json({ error: 'Enter a valid HTTPS Google review link.' }, { status: 400 });
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
        return NextResponse.json({ error: 'Order quantity must be between 1 and 500.' }, { status: 400 });
      }
      if (!REVIEW_CARD_MATERIALS.includes(material)) {
        return NextResponse.json({ error: 'Choose paper or transparent sticker material.' }, { status: 400 });
      }
      if (!stickerText) return NextResponse.json({ error: 'Sticker text cannot be blank.' }, { status: 400 });
      try {
        createReviewCardStickerSvg(googleReviewUrl, businessName, stickerText, material);
      } catch (error) {
        return NextResponse.json({
          error: error instanceof Error ? error.message : 'Use a shorter Google review link for a scannable sticker.',
        }, { status: 400 });
      }

      const now = new Date().toISOString();
      const order: ReviewCardOrder = {
        id: `FNRC-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
        createdAt: now,
        updatedAt: now,
        status: 'NEW',
        source: 'WALK_IN',
        businessName,
        googleReviewUrl,
        quantity,
        material,
        stickerText,
        logoDataUrl: '',
        customerName,
        phone,
        whatsapp,
        email: '',
        deliveryAddress: 'In-person order',
        notes,
        adminNotes: '',
        approvedStickerSvg: '',
        approvedStickerAt: '',
        printRuns: [],
      };
      await saveReviewCardOrder(req.url, order);
      return NextResponse.json({ success: true, order });
    }

    const id = typeof body.orderId === 'string' ? body.orderId : '';
    if (!id || !/^FNRC-[A-Z0-9-]+$/.test(id)) {
      return NextResponse.json({ error: 'A valid order reference is required.' }, { status: 400 });
    }
    const orders = await loadReviewCardOrders(req.url);
    const storedOrder = orders.find((candidate) => candidate.id === id);
    if (!storedOrder) return NextResponse.json({ error: 'Review Cards order not found.' }, { status: 404 });
    const order = await hydrateReviewCardLogo(storedOrder);

    if (body.action === 'save_design') {
      const material = body.material as ReviewCardMaterial;
      const stickerText = typeof body.stickerText === 'string' ? body.stickerText.trim().slice(0, 80) : '';
      if (!REVIEW_CARD_MATERIALS.includes(material)) {
        return NextResponse.json({ error: 'Choose paper or transparent sticker material.' }, { status: 400 });
      }
      if (!stickerText) return NextResponse.json({ error: 'Sticker text cannot be blank.' }, { status: 400 });
      order.material = material;
      order.stickerText = stickerText;
      order.status = 'APPROVED';
      order.approvedStickerSvg = createReviewCardStickerSvg(
        order.googleReviewUrl,
        order.businessName,
        stickerText,
        material,
        order.logoDataUrl
      );
      order.approvedStickerAt = new Date().toISOString();
      order.adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.trim().slice(0, 2000) : order.adminNotes;
    } else if (body.action === 'update_order') {
      const status = body.status;
      if (!REVIEW_CARD_STATUS.includes(status)) {
        return NextResponse.json({ error: 'Choose a valid order status.' }, { status: 400 });
      }
      order.status = status;
      order.adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.trim().slice(0, 2000) : order.adminNotes;
    } else if (body.action === 'record_print' || body.action === 'record_reprint') {
      const copies = Number(body.copies);
      if (!Number.isInteger(copies) || copies < 1 || copies > order.quantity) {
        return NextResponse.json({ error: `Print quantity must be between 1 and the ordered quantity (${order.quantity}).` }, { status: 400 });
      }
      let sourcePrintRun: ReviewCardPrintRun | undefined;
      if (body.action === 'record_reprint') {
        sourcePrintRun = order.printRuns.find((run) => run.id === body.printRunId);
        if (!sourcePrintRun) return NextResponse.json({ error: 'The original print record was not found.' }, { status: 404 });
      } else if (!order.approvedStickerSvg || !order.approvedStickerAt) {
        return NextResponse.json({ error: 'Save and approve the sticker design before printing.' }, { status: 400 });
      }
      const printRun: ReviewCardPrintRun = {
        id: crypto.randomUUID(),
        printedAt: new Date().toISOString(),
        copies,
        material: sourcePrintRun?.material || order.material,
        stickerText: sourcePrintRun?.stickerText || order.stickerText,
        stickerSvg: sourcePrintRun?.stickerSvg || order.approvedStickerSvg,
        reprintOf: sourcePrintRun?.id,
      };
      order.printRuns = [...order.printRuns, printRun];
      order.status = 'PRINTED';
    } else {
      return NextResponse.json({ error: 'Unknown Review Cards admin action.' }, { status: 400 });
    }

    order.updatedAt = new Date().toISOString();
    await saveReviewCardOrder(req.url, { ...order, logoDataUrl: '' });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[Review Cards] Admin update failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not update Review Cards order.' }, { status: 500 });
  }
}
