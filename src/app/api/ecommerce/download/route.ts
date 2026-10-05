import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';
import { getDigitalFileBucket, getDigitalFileObjectKey } from '@/lib/ecommerce/digital-file-storage';

export const runtime = 'edge';

const DOWNLOAD_TTL_MS = 60 * 60 * 1000;

async function signPayload(payload: Record<string, string | number>) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('Download signing is not configured.');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = encoder.encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(sig))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPayload(payload: Record<string, string | number>, token: string) {
  const expected = await signPayload(payload);
  return expected === token;
}

function getProductAndFile(db: Awaited<ReturnType<typeof loadEcommerceDb>>, productId: string, fileId: string) {
  const product = db.products.find((current) => current.id === productId);
  if (!product) return { product: null, file: null };
  const file = product.downloadableFiles?.find((current) => current.id === fileId);
  return { product, file };
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.AUTH_SECRET) {
      return NextResponse.json({ error: 'Secure downloads are not configured.' }, { status: 503 });
    }
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const fileId = url.searchParams.get('fileId');
    const orderId = url.searchParams.get('orderId');
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');
    const expiresAtValue = url.searchParams.get('expiresAt');
    const expiresAt = expiresAtValue ? Number(expiresAtValue) : Number.NaN;

    if (!productId || !fileId || !orderId || !token || !Number.isSafeInteger(expiresAt)) {
      return NextResponse.json({ error: 'Missing secure download parameters.' }, { status: 400 });
    }
    if (expiresAt <= Date.now()) {
      return NextResponse.json({ error: 'This download link has expired. Request a new link from your order page.' }, { status: 410 });
    }

    const db = await loadEcommerceDb(req.url);
    const { product, file } = getProductAndFile(db, productId, fileId);
    if (!product || !file) {
      return NextResponse.json({ error: 'Product file not found.' }, { status: 404 });
    }

    const order = db.orders.find((current) => current.id === orderId);
    const tokenPayload = {
      productId,
      fileId,
      orderId,
      email: email || order?.customer.email || '',
      expiresAt,
    };

    const isTokenValid = await verifyPayload(tokenPayload, token);
    const hasEntitlement = Boolean(
      order &&
        order.paymentStatus === 'PAID' &&
        order.items.some((item) => item.productId === productId)
    );

    if (!order || !isTokenValid || !hasEntitlement) {
      return NextResponse.json({ error: 'This download is not available for the current order.' }, { status: 403 });
    }
    const entitlement = db.entitlements?.find((current) =>
      current.orderId === order.id && current.productId === productId && current.status === 'ACTIVE'
    );
    if (!entitlement || !entitlement.fileIds.includes(fileId)) {
      return NextResponse.json({ error: 'This file is not included in the purchase entitlement.' }, { status: 403 });
    }
    entitlement.downloadCount += 1;
    entitlement.lastDownloadedAt = new Date().toISOString();
    await saveEcommerceDb(req.url, db);

    if (file.deliveryType === 'LINK') {
      if (!file.url.startsWith('https://')) {
        return NextResponse.json({ error: 'The external delivery link is invalid.' }, { status: 400 });
      }
      return NextResponse.redirect(file.url, 302);
    }

    const r2Key = getDigitalFileObjectKey(file.url);
    if (r2Key) {
      const bucket = await getDigitalFileBucket();
      if (!bucket) {
        return NextResponse.json({ error: 'Digital file storage is temporarily unavailable.' }, { status: 503 });
      }
      const object = await bucket.get(r2Key);
      if (!object) {
        return NextResponse.json({ error: 'The digital file is temporarily unavailable.' }, { status: 404 });
      }
      return new Response(object.body, {
        headers: {
          'Content-Type': file.mimeType || object.httpMetadata?.contentType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.filename.replace(/["\r\n]/g, '_')}"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    const dataUrlMatch = /^data:(application\/(?:pdf|zip));base64,([A-Za-z0-9+/=]+)$/i.exec(file.url);
    if (dataUrlMatch) {
      const binary = atob(dataUrlMatch[2]);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new Response(bytes, {
        headers: {
          'Content-Type': file.mimeType || dataUrlMatch[1],
          'Content-Disposition': `attachment; filename="${file.filename.replace(/["\r\n]/g, '_')}"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    if (file.url.startsWith('http://') || file.url.startsWith('https://')) {
      const fileResponse = await fetch(file.url);
      if (!fileResponse.ok || !fileResponse.body) {
        return NextResponse.json({ error: 'The digital file is temporarily unavailable.' }, { status: 502 });
      }
      return new Response(fileResponse.body, {
        headers: {
          'Content-Type': file.mimeType || fileResponse.headers.get('content-type') || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.filename.replace(/["\r\n]/g, '_')}"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    return new NextResponse(file.url, {
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Secure digital download failed:', error);
    return NextResponse.json({ error: error.message || 'Download failed.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.AUTH_SECRET) {
      return NextResponse.json({ error: 'Secure downloads are not configured.' }, { status: 503 });
    }
    const body = await req.json();
    const { productId, fileId, orderId, trackingToken, email } = body as {
      productId?: string;
      fileId?: string;
      orderId?: string;
      trackingToken?: string;
      email?: string;
    };

    if (!productId || !fileId || !orderId || !trackingToken) {
      return NextResponse.json({ error: 'Product, order, and order access token are required.' }, { status: 400 });
    }

    const db = await loadEcommerceDb(req.url);
    const { product, file } = getProductAndFile(db, productId, fileId);
    if (!product || !file) {
      return NextResponse.json({ error: 'Product file not found.' }, { status: 404 });
    }

    const order = db.orders.find((current) => current.id === orderId);
    const hasEntitlement = Boolean(
      order &&
        order.trackingToken === trackingToken &&
        order.paymentStatus === 'PAID' &&
        order.items.some((item) => item.productId === productId)
    );

    if (!hasEntitlement) {
      return NextResponse.json({ error: 'Order entitlement required before file download is allowed.' }, { status: 403 });
    }

    const expiresAt = Date.now() + DOWNLOAD_TTL_MS;
    const payload = {
      productId,
      fileId,
      orderId,
      email: email || order?.customer.email || '',
      expiresAt,
    };
    const token = await signPayload(payload);
    const requestUrl = new URL(req.url);
    const downloadUrl = new URL('/api/ecommerce/download', requestUrl.origin);
    downloadUrl.searchParams.set('productId', productId);
    downloadUrl.searchParams.set('fileId', fileId);
    downloadUrl.searchParams.set('orderId', orderId);
    downloadUrl.searchParams.set('email', payload.email as string);
    downloadUrl.searchParams.set('expiresAt', String(expiresAt));
    downloadUrl.searchParams.set('token', token);

    return NextResponse.json({
      success: true,
      productTitle: product.title,
      fileName: file.filename,
      deliveryType: file.deliveryType || 'FILE',
      expiresAt: new Date(expiresAt).toISOString(),
      downloadUrl: downloadUrl.toString(),
    });
  } catch (error: any) {
    console.error('Secure digital download token generation failed:', error);
    return NextResponse.json({ error: error.message || 'Download token generation failed.' }, { status: 500 });
  }
}
