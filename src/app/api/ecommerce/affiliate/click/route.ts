import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const redirectParam = url.searchParams.get('redirect') === 'true';

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const db = await loadEcommerceDb(req.url);
    const product = db.products.find((p) => p.id === productId);

    if (!product || product.fulfillmentType !== 'AFFILIATE' || !product.affiliateDetails?.affiliateUrl) {
      return NextResponse.json({ error: 'Affiliate product not found or missing URL.' }, { status: 404 });
    }

    // Increment click count
    if (!product.affiliateDetails.clickCount) {
      product.affiliateDetails.clickCount = 1;
    } else {
      product.affiliateDetails.clickCount += 1;
    }

    product.updatedAt = new Date().toISOString();
    await saveEcommerceDb(req.url, db);

    const destination = product.affiliateDetails.affiliateUrl;

    if (redirectParam) {
      return NextResponse.redirect(destination, 302);
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      clickCount: product.affiliateDetails.clickCount,
      destinationUrl: destination,
    });
  } catch (error: any) {
    console.error('Affiliate click track error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const db = await loadEcommerceDb(req.url);
    const product = db.products.find((p) => p.id === productId);

    if (!product || product.fulfillmentType !== 'AFFILIATE' || !product.affiliateDetails?.affiliateUrl) {
      return NextResponse.json({ error: 'Affiliate product not found.' }, { status: 404 });
    }

    if (!product.affiliateDetails.clickCount) {
      product.affiliateDetails.clickCount = 1;
    } else {
      product.affiliateDetails.clickCount += 1;
    }

    product.updatedAt = new Date().toISOString();
    await saveEcommerceDb(req.url, db);

    return NextResponse.json({
      success: true,
      productId: product.id,
      clickCount: product.affiliateDetails.clickCount,
      destinationUrl: product.affiliateDetails.affiliateUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
