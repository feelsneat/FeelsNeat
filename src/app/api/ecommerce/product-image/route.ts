import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb } from '@/lib/ecommerce/db';
import { getR2Object } from '@/lib/ecommerce/digital-file-storage';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const imageId = url.searchParams.get('imageId');
    const productId = url.searchParams.get('productId');
    const variantId = url.searchParams.get('variantId');
    const imageIndexValue = url.searchParams.get('imageIndex');
    const imageIndex = imageIndexValue === null ? Number.NaN : Number(imageIndexValue);
    if (imageId) {
      if (!/^(?:[0-9a-f-]{36}|[0-9a-f]{64})$/i.test(imageId) ||
        productId || variantId || imageIndexValue !== null) {
        return NextResponse.json({ error: 'A valid product image reference is required.' }, { status: 400 });
      }
      const object = await getR2Object(`product-images/${imageId}`);
      if (!object) return NextResponse.json({ error: 'Product image not found.' }, { status: 404 });
      const contentType = object.httpMetadata?.contentType;
      if (!contentType || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
        return NextResponse.json({ error: 'Product image not found.' }, { status: 404 });
      }
      const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      });
      if (object.size !== undefined) headers.set('Content-Length', String(object.size));
      if (object.httpEtag) headers.set('ETag', object.httpEtag);
      return new Response(object.body, { headers });
    }

    if (
      !productId ||
      (!variantId && !Number.isSafeInteger(imageIndex)) ||
      (variantId && imageIndexValue !== null)
    ) {
      return NextResponse.json({ error: 'A product and image reference are required.' }, { status: 400 });
    }

    const db = await loadEcommerceDb(req.url);
    const product = db.products.find((current) =>
      current.id === productId && (current.status === 'ACTIVE' || current.status === 'PUBLISHED')
    );
    if (!product) return NextResponse.json({ error: 'Product image not found.' }, { status: 404 });

    const image = variantId
      ? product.variants.find((variant) => variant.id === variantId)?.image
      : product.images[imageIndex];
    const match = image?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) return NextResponse.json({ error: 'Product image not found.' }, { status: 404 });

    const binary = atob(match[2].replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new Response(bytes, {
      headers: {
        'Content-Type': match[1],
        'Content-Length': String(bytes.byteLength),
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Product image request failed:', error);
    return NextResponse.json({ error: 'Product image is temporarily unavailable.' }, { status: 500 });
  }
}
