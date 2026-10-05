import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb } from '@/lib/ecommerce/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const variantId = url.searchParams.get('variantId');
    const imageIndexValue = url.searchParams.get('imageIndex');
    const imageIndex = imageIndexValue === null ? Number.NaN : Number(imageIndexValue);
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
