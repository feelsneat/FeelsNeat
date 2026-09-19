import { NextRequest, NextResponse } from 'next/server';
import { loadEcommerceDb } from '@/lib/ecommerce/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const db = await loadEcommerceDb(req.url);
    const url = new URL(req.url);

    const categorySlug = url.searchParams.get('category');
    const collectionSlug = url.searchParams.get('collection');
    const search = url.searchParams.get('search')?.toLowerCase().trim();
    const productSlug = url.searchParams.get('slug');
    const sort = url.searchParams.get('sort'); // price_asc, price_desc, newest

    // Single product lookup
    if (productSlug) {
      const product = db.products.find(
        (p) => p.slug === productSlug && p.status === 'ACTIVE'
      );
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Sanitize product for customer view: NEVER expose supplier mapping, cost, or supplier SKU!
      const sanitized = {
        id: product.id,
        slug: product.slug,
        title: product.title,
        shortDescription: product.shortDescription,
        description: product.description,
        categoryId: product.categoryId,
        collectionIds: product.collectionIds,
        brand: product.brand,
        tags: product.tags,
        sku: product.sku,
        sellingPrice: product.sellingPrice,
        compareAtPrice: product.compareAtPrice,
        images: product.images,
        hasVariants: product.hasVariants,
        variants: product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          title: v.title,
          attributes: v.attributes,
          sellingPrice: v.sellingPrice,
          compareAtPrice: v.compareAtPrice,
          weightGrams: v.weightGrams,
          stockQuantity: v.stockQuantity,
          image: v.image,
          active: v.active,
        })),
        fulfillmentType: product.fulfillmentType || 'DROPSHIP',
        affiliateDetails: product.affiliateDetails ? {
          affiliateUrl: product.affiliateDetails.affiliateUrl,
          platform: product.affiliateDetails.platform,
          merchantName: product.affiliateDetails.merchantName,
          buttonText: product.affiliateDetails.buttonText || 'Buy Now ↗',
          clickCount: product.affiliateDetails.clickCount || 0,
          disclaimerText: product.affiliateDetails.disclaimerText,
        } : undefined,
        weightGrams: product.weightGrams,
        dimensions: product.dimensions,
        stockQuantity: product.stockQuantity,
        taxIncluded: product.taxIncluded,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
      };

      return NextResponse.json({ product: sanitized });
    }

    // Filter active products
    let items = db.products.filter((p) => p.status === 'ACTIVE');

    if (categorySlug) {
      const cat = db.categories.find((c) => c.slug === categorySlug);
      if (cat) {
        // Include direct category or child categories
        const childCategoryIds = db.categories
          .filter((c) => c.parentId === cat.id)
          .map((c) => c.id);
        items = items.filter(
          (p) => p.categoryId === cat.id || childCategoryIds.includes(p.categoryId)
        );
      }
    }

    if (collectionSlug) {
      const col = db.collections.find((c) => c.slug === collectionSlug);
      if (col) {
        items = items.filter((p) => p.collectionIds.includes(col.id));
      }
    }

    const typeFilter = url.searchParams.get('type'); // dropship, affiliate

    if (typeFilter === 'dropship') {
      items = items.filter((p) => !p.fulfillmentType || p.fulfillmentType === 'DROPSHIP');
    } else if (typeFilter === 'affiliate') {
      items = items.filter((p) => p.fulfillmentType === 'AFFILIATE');
    }

    if (search) {
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          (p.shortDescription || '').toLowerCase().includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(search))
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      items.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sort === 'price_desc') {
      items.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else {
      // Default: newest
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Sanitize products to strip supplier confidential fields
    const sanitizedProducts = items.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      shortDescription: product.shortDescription,
      description: product.description,
      categoryId: product.categoryId,
      collectionIds: product.collectionIds,
      brand: product.brand,
      tags: product.tags,
      sku: product.sku,
      sellingPrice: product.sellingPrice,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      hasVariants: product.hasVariants,
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        attributes: v.attributes,
        sellingPrice: v.sellingPrice,
        compareAtPrice: v.compareAtPrice,
        weightGrams: v.weightGrams,
        stockQuantity: v.stockQuantity,
        image: v.image,
        active: v.active,
      })),
      fulfillmentType: product.fulfillmentType || 'DROPSHIP',
      affiliateDetails: product.affiliateDetails ? {
        affiliateUrl: product.affiliateDetails.affiliateUrl,
        platform: product.affiliateDetails.platform,
        merchantName: product.affiliateDetails.merchantName,
        buttonText: product.affiliateDetails.buttonText || 'Buy Now ↗',
        clickCount: product.affiliateDetails.clickCount || 0,
        disclaimerText: product.affiliateDetails.disclaimerText,
      } : undefined,
      stockQuantity: product.stockQuantity,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
    }));

    return NextResponse.json({
      products: sanitizedProducts,
      categories: db.categories.filter((c) => c.active),
      collections: db.collections.filter((c) => c.active),
      settings: {
        storeName: db.settings.storeName,
        freeShippingThreshold: db.settings.freeShippingThreshold,
        standardShippingFee: db.settings.standardShippingFee,
        currency: db.settings.currency,
        codAvailable: db.settings.codAvailable,
        codFee: db.settings.codFee,
      },
    });
  } catch (error: any) {
    console.error('Failed to load ecommerce products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
