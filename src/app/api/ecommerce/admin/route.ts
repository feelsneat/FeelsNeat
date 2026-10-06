import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';
import { Product, Category, Collection, Discount, EcommerceOrder } from '@/lib/ecommerce/types';
import { getPaymentProvider } from '@/lib/ecommerce/payments/mock';
import { getFulfillmentProvider } from '@/lib/ecommerce/fulfillment/mock';
import { isDigitalProduct } from '@/lib/ecommerce/product-classification';
import {
  detectImageMimeType,
  getDigitalFileBucket,
  imageBytesToBase64,
  putR2Object,
} from '@/lib/ecommerce/digital-file-storage';

export const runtime = 'edge';

const MAX_PRODUCT_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DATA_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DIGITAL_PRODUCT_TYPES = new Set([
  'PRINTABLE', 'TEMPLATE', 'CARD', 'PROMPT_PACK', 'TRACKING_SHEET', 'PLANNER',
  'GUIDE', 'STUDY_RESOURCE', 'TOOLKIT', 'BUNDLE', 'OTHER',
]);
const FULFILLMENT_TYPES = new Set(['DROPSHIP', 'AFFILIATE', 'DIRECT']);

function validateProductImages(images: unknown): string[] | null {
  if (images === undefined) return [];
  if (!Array.isArray(images) || images.length > MAX_PRODUCT_IMAGES) return null;
  let totalDataBytes = 0;
  for (const image of images) {
    if (typeof image !== 'string' || image.length === 0) return null;
    if (/^r2:\/\/product-images\/(?:[0-9a-f-]{36}|[0-9a-f]{64})$/i.test(image)) continue;
    if (image.startsWith('data:')) {
      const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
      if (!match || !ALLOWED_IMAGE_MIME_TYPES.has(match[1])) return null;
      const base64 = match[2].replace(/\s/g, '');
      const bytes = Math.floor((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
      if (bytes < 1 || bytes > MAX_IMAGE_BYTES) return null;
      try {
        const binary = atob(base64);
        const signature = Array.from(binary.slice(0, 12), (character) => character.charCodeAt(0));
        const isJpeg = match[1] === 'image/jpeg' && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
        const isPng = match[1] === 'image/png' && signature.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
        const isWebp = match[1] === 'image/webp' && binary.slice(0, 4) === 'RIFF' && binary.slice(8, 12) === 'WEBP';
        if (!isJpeg && !isPng && !isWebp) return null;
      } catch {
        return null;
      }

      totalDataBytes += bytes;
      if (totalDataBytes > MAX_IMAGE_DATA_BYTES) return null;
    } else {
      try {
        const url = new URL(image);
        if (!['http:', 'https:'].includes(url.protocol)) return null;
      } catch {
        return null;
      }
    }
  }
  return images;
}

async function migrateProductImageToR2(image: string): Promise<string | null> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(image);
  if (!match) return null;
  const base64 = match[2].replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (detectImageMimeType(bytes) !== match[1]) return null;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  await putR2Object(`product-images/${hash}`, bytes, match[1]);
  return `r2://product-images/${hash}`;
}

function validateDigitalProduct(product: Product): string | null {
  const isDigital = product.productType && product.productType !== 'PHYSICAL' && product.productType !== 'AFFILIATE';
  if (!isDigital) return null;
  if (!product.slug?.trim()) return 'Digital products require a slug.';
  if (!Number.isFinite(product.sellingPrice) || product.sellingPrice < 0) return 'Price must be a non-negative number.';
  if (product.compareAtPrice != null && (!Number.isFinite(product.compareAtPrice) || product.compareAtPrice < product.sellingPrice)) return 'Compare-at price must be greater than or equal to price.';
  if (!product.digitalProductType || !DIGITAL_PRODUCT_TYPES.has(product.digitalProductType)) return 'Choose a valid digital product type.';
  if (!Array.isArray(product.downloadableFiles) || product.downloadableFiles.length === 0) return 'At least one downloadable file is required for a digital product.';
  if (product.downloadableFiles.length > 10) return 'A digital product can have at most 10 files or delivery links.';
  for (const file of product.downloadableFiles) {
    if (!file || !file.id || !file.title?.trim() || !file.filename?.trim() || !file.mimeType?.trim() || !file.url?.trim()) return 'Every downloadable file needs an id, title, filename, MIME type, and URL.';
    if (file.deliveryType && !['FILE', 'LINK'].includes(file.deliveryType)) return 'Choose file download or external link delivery.';
    if (/^r2:\/\//i.test(file.url)) {
      if (file.deliveryType === 'LINK' || !/^r2:\/\/digital-files\/[0-9a-f-]{36}$/i.test(file.url)) {
        return 'Uploaded digital files must use a valid stored file reference.';
      }
      continue;
    }
    if (/^data:/i.test(file.url)) {
      if (process.env.NODE_ENV !== 'development' || file.deliveryType === 'LINK' ||
        !/^data:application\/(?:pdf|zip|x-zip-compressed);base64,/i.test(file.url)) {
        return 'Uploaded files must be stored in the configured digital file bucket.';
      }
      continue;
    }
    try {
      const url = new URL(file.url);
      if (!['http:', 'https:'].includes(url.protocol)) return 'Downloadable file URLs must use HTTP(S).';
      if (file.deliveryType === 'LINK' && url.protocol !== 'https:') return 'External delivery links must use HTTPS.';
    } catch {
      return 'Downloadable file URLs must be valid HTTP(S) URLs.';
    }
  }
  return null;
}

async function authenticateAdmin(req: NextRequest): Promise<boolean> {
  const sessionCookie = req.cookies.get('feelsneat_session');
  if (!sessionCookie || !sessionCookie.value) return false;

  const authSecret = process.env.AUTH_SECRET || (
    process.env.NODE_ENV === 'development'
      ? 'local_dev_secret_key_needs_to_be_long_and_secure_32_chars'
      : undefined
  );
  if (!authSecret) return false;

  const decoded = await verifySession(sessionCookie.value, authSecret);
  return decoded !== null;
}

export async function GET(req: NextRequest) {
  const isAuthed = await authenticateAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await loadEcommerceDb(req.url);
    const store = new URL(req.url).searchParams.get('store');
    const products = store === 'digital'
      ? db.products.filter(isDigitalProduct)
      : store === 'physical'
        ? db.products.filter((product) => !isDigitalProduct(product))
        : db.products;
    const orders = store
      ? db.orders.filter((order) => {
        const orderIsDigital = order.items.some((item) => {
          const product = db.products.find((current) => current.id === item.productId);
          return product ? isDigitalProduct(product) : false;
        });
        return store === 'digital' ? orderIsDigital : !orderIsDigital;
      })
      : db.orders;

    // Compute live operational metrics for Dashboard
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const estimatedProfit = paidOrders.reduce(
      (sum, o) => sum + (o.estimatedMargin?.estimatedProfit || 0),
      0
    );

    const affiliateProducts = db.products.filter((p) => p.fulfillmentType === 'AFFILIATE');
    const dropshipProducts = db.products.filter((p) => !isDigitalProduct(p) && p.fulfillmentType !== 'AFFILIATE' && (!p.fulfillmentType || p.fulfillmentType === 'DROPSHIP'));
    const totalAffiliateClicks = affiliateProducts.reduce(
      (sum, p) => sum + (p.affiliateDetails?.clickCount || 0),
      0
    );
    const dropshipOrders = db.orders.filter((order) => order.items.some((item) => {
      const product = db.products.find((current) => current.id === item.productId);
      return product && !isDigitalProduct(product) && product.fulfillmentType !== 'AFFILIATE' &&
        (!product.fulfillmentType || product.fulfillmentType === 'DROPSHIP');
    }));
    const dropshipPaidOrders = dropshipOrders.filter((o) => o.paymentStatus === 'PAID' || o.paymentMethod === 'COD');
    const affiliateReferenceValue = affiliateProducts.reduce((sum, p) =>
      sum + ((p.affiliateDetails?.clickCount || 0) * p.sellingPrice), 0
    );

    const metrics = {
      totalOrders: orders.length,
      todayOrdersCount: todayOrders.length,
      pendingPaymentCount: orders.filter((o) => o.paymentStatus === 'PENDING').length,
      confirmedCount: db.orders.filter((o) => o.orderStatus === 'CONFIRMED').length,
      processingCount: db.orders.filter((o) => o.orderStatus === 'PROCESSING').length,
      shippedCount: db.orders.filter((o) => o.orderStatus === 'SHIPPED').length,
      deliveredCount: db.orders.filter((o) => o.orderStatus === 'DELIVERED').length,
      rtoCount: db.orders.filter((o) => o.orderStatus === 'RTO').length,
      returnedCount: db.orders.filter((o) => o.orderStatus === 'RETURNED').length,
      totalRevenue,
      estimatedProfit,
      dropshipOrdersCount: dropshipOrders.length,
      dropshipRevenue: dropshipPaidOrders.reduce((sum, o) => sum + o.total, 0),
      dropshipEstimatedProfit: dropshipPaidOrders.reduce((sum, o) => sum + (o.estimatedMargin?.estimatedProfit || 0), 0),
      totalAffiliateClicks,
      affiliateReferenceValue,
      affiliateProductsCount: affiliateProducts.length,
      dropshipProductsCount: dropshipProducts.length,
      razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      aliShippingConfigured: Boolean(process.env.ALISHIPPING_API_KEY && process.env.ALISHIPPING_API_SECRET),
    };

    return NextResponse.json({
      ...db,
      products,
      orders,
      metrics,
    });
  } catch (error: any) {
    console.error('Admin Ecommerce GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuthed = await authenticateAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const isMultipart = /multipart\/form-data/i.test(req.headers.get('content-type') || '');
    let body: any;
    if (isMultipart) {
      const formData = await req.formData();
      body = {
        action: formData.get('action'),
        file: formData.get('file'),
        filename: formData.get('filename'),
        title: formData.get('title'),
      };
    } else {
      body = await req.json();
    }
    const { action } = body;

    if (action === 'upload_digital_file') {
      const { fileData, filename, title } = body as {
        fileData?: string;
        filename?: string;
        title?: string;
        file?: File;
      };
      if (!filename?.trim() || !title?.trim()) {
        return NextResponse.json({ error: 'File, filename, and title are required.' }, { status: 400 });
      }
      const maxFileBytes = 20 * 1024 * 1024;
      let bytes: Uint8Array;
      let normalizedMimeType: string;
      let sizeBytes: number;
      let base64: string | undefined;
      if (typeof File !== 'undefined' && body.file instanceof File) {
        const extension = filename.split('.').pop()?.toLowerCase();
        if (extension !== 'pdf' && extension !== 'zip') {
          return NextResponse.json({ error: 'Upload a PDF or ZIP file.' }, { status: 400 });
        }
        normalizedMimeType = extension === 'pdf' ? 'application/pdf' : 'application/zip';
        sizeBytes = body.file.size;
        if (sizeBytes < 1 || sizeBytes > maxFileBytes) {
          return NextResponse.json({ error: 'PDF and ZIP uploads must be no larger than 20 MB each.' }, { status: 400 });
        }
        try {
          bytes = new Uint8Array(await body.file.arrayBuffer());
        } catch (error) {
          console.error('Digital file upload could not be read:', error);
          return NextResponse.json({ error: 'The selected file could not be read. Please try selecting it again.' }, { status: 400 });
        }
      } else {
        if (!fileData) {
          return NextResponse.json({ error: 'File, filename, and title are required.' }, { status: 400 });
        }
        const dataMatch = /^data:(application\/(?:pdf|zip|x-zip-compressed));base64,([A-Za-z0-9+/=]+)$/i.exec(fileData);
        if (!dataMatch) {
          return NextResponse.json({ error: 'Upload a PDF or ZIP file.' }, { status: 400 });
        }
        normalizedMimeType = dataMatch[1].toLowerCase() === 'application/x-zip-compressed'
          ? 'application/zip'
          : dataMatch[1].toLowerCase();
        base64 = dataMatch[2];
        const paddingBytes = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
        sizeBytes = Math.floor((base64.length * 3) / 4) - paddingBytes;
        if (sizeBytes < 1 || sizeBytes > maxFileBytes) {
          return NextResponse.json({ error: 'PDF and ZIP uploads must be no larger than 20 MB each.' }, { status: 400 });
        }
        try {
          const binary = atob(base64);
          bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        } catch {
          return NextResponse.json({ error: 'The uploaded file could not be decoded.' }, { status: 400 });
        }
      }
      const isPdf = normalizedMimeType === 'application/pdf' &&
        new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
      const isZip = normalizedMimeType === 'application/zip' &&
        bytes[0] === 0x50 && bytes[1] === 0x4b &&
        [0x03, 0x05, 0x07].includes(bytes[2]) &&
        [0x04, 0x06, 0x08].includes(bytes[3]);
      if (!isPdf && !isZip) {
        return NextResponse.json({ error: 'The file contents do not match a valid PDF or ZIP file.' }, { status: 400 });
      }

      const id = crypto.randomUUID();
      const bucket = await getDigitalFileBucket();
      let storedUrl: string;
      if (bucket) {
        await bucket.put(`digital-files/${id}`, bytes, {
          httpMetadata: { contentType: normalizedMimeType },
        });
        storedUrl = `r2://digital-files/${id}`;
      } else if (process.env.NODE_ENV === 'development') {
        if (!base64) base64 = imageBytesToBase64(bytes);
        storedUrl = `data:${normalizedMimeType};base64,${base64}`;
      } else {
        return NextResponse.json(
          { error: 'Digital file storage is not configured. Bind the FEELSNEAT_DIGITAL_FILES R2 bucket in Cloudflare.' },
          { status: 503 }
        );
      }

      return NextResponse.json({
        success: true,
        file: {
          id,
          title: title.trim(),
          filename: filename.trim().replace(/[\\/"]/g, '_'),
          mimeType: normalizedMimeType,
          sizeBytes,
          url: storedUrl,
          deliveryType: 'FILE',
        },
      });
    }

    if (action === 'upload_product_image') {
      if (typeof File === 'undefined' || !(body.file instanceof File)) {
        return NextResponse.json({ error: 'Choose a JPG, PNG, or WEBP image to upload.' }, { status: 400 });
      }
      if (body.file.size < 1 || body.file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: 'Product images must be no larger than 5 MB each.' }, { status: 400 });
      }
      let bytes: Uint8Array;
      try {
        bytes = new Uint8Array(await body.file.arrayBuffer());
      } catch (error) {
        console.error('Product image upload could not be read:', error);
        return NextResponse.json({ error: 'The selected image could not be read. Please try again.' }, { status: 400 });
      }
      const mimeType = detectImageMimeType(bytes);
      if (!mimeType || body.file.type !== mimeType) {
        return NextResponse.json({ error: 'Image contents must match a JPG, PNG, or WEBP file.' }, { status: 400 });
      }
      const id = crypto.randomUUID();
      const bucket = await getDigitalFileBucket();
      let reference: string;
      if (bucket) {
        await bucket.put(`product-images/${id}`, bytes, {
          httpMetadata: {
            contentType: mimeType,
            cacheControl: 'public, max-age=31536000, immutable',
          },
        });
        reference = `r2://product-images/${id}`;
      } else if (process.env.NODE_ENV === 'development') {
        reference = `data:${mimeType};base64,${imageBytesToBase64(bytes)}`;
      } else {
        return NextResponse.json(
          { error: 'Product image storage is not configured. Bind FEELSNEAT_DIGITAL_FILES in Cloudflare.' },
          { status: 503 }
        );
      }
      const imageUrl = reference.startsWith('r2://')
        ? new URL(`/api/ecommerce/product-image?imageId=${id}`, req.url).toString()
        : reference;
      return NextResponse.json({ success: true, image: { reference, imageUrl, sizeBytes: bytes.byteLength } });
    }

    const db = await loadEcommerceDb(req.url);
    const now = new Date().toISOString();

    if (action === 'migrate_product_images') {
      let migratedCount = 0;
      const batchSize = 1;
      for (const product of db.products) {
        for (let index = 0; index < (product.images || []).length && migratedCount < batchSize; index += 1) {
          const image = product.images[index];
          if (!image.startsWith('data:image/')) continue;
          const reference = await migrateProductImageToR2(image);
          if (!reference) throw new Error(`Product image for "${product.title}" is not a valid supported image.`);
          product.images[index] = reference;
          migratedCount += 1;
        }
        for (const variant of product.variants || []) {
          if (migratedCount >= batchSize) break;
          if (!variant.image?.startsWith('data:image/')) continue;
          const reference = await migrateProductImageToR2(variant.image);
          if (!reference) throw new Error(`Variant image for "${product.title}" is not a valid supported image.`);
          variant.image = reference;
          migratedCount += 1;
        }
      }
      if (migratedCount > 0) await saveEcommerceDb(req.url, db);
      const remainingCount = db.products.reduce((total, product) =>
        total +
        (product.images || []).filter((image) => image.startsWith('data:image/')).length +
        (product.variants || []).filter((variant) => variant.image?.startsWith('data:image/')).length,
      0);
      return NextResponse.json({
        success: true,
        migratedCount,
        remainingCount,
        complete: remainingCount === 0,
      });
    }

    // ─── PRODUCT ACTIONS ──────────────────────────────────────────
    if (action === 'save_product' || action === 'save_affiliate_product') {
      const productData: Product = {
        ...body.product,
        ...(action === 'save_affiliate_product' ? { fulfillmentType: 'AFFILIATE' } : {}),
      };
      if (productData.fulfillmentType === 'AFFILIATE') {
        productData.productType = 'PHYSICAL';
      }
      if (productData.status === 'PUBLISHED') {
        productData.status = 'ACTIVE';
      }
      if (!productData.productType && productData.downloadableFiles?.length) {
        productData.productType = 'TEMPLATE';
        productData.digitalProductType = 'TEMPLATE';
      }
      if (productData.downloadableFiles?.length && !productData.fulfillmentType) {
        productData.fulfillmentType = 'DIRECT';
      }
      if (!productData || !productData.title || !productData.sku) {
        return NextResponse.json({ error: 'Product title and SKU are required.' }, { status: 400 });
      }
      const existingProduct = productData.id ? db.products.find((product) => product.id === productData.id) : null;
      const existingIsDigital = existingProduct ? isDigitalProduct(existingProduct) : null;
      const nextIsDigital = isDigitalProduct(productData);
      if (productData.fulfillmentType && !FULFILLMENT_TYPES.has(productData.fulfillmentType)) {
        return NextResponse.json({ error: 'Choose a valid product fulfillment model.' }, { status: 400 });
      }
      if (
        !Number.isFinite(productData.sellingPrice) ||
        productData.sellingPrice < 0 ||
        (productData.compareAtPrice != null &&
          (!Number.isFinite(productData.compareAtPrice) || productData.compareAtPrice < productData.sellingPrice))
      ) {
        return NextResponse.json({ error: 'Product price must be non-negative; compare-at price must be greater than or equal to it.' }, { status: 400 });
      }
      if (existingIsDigital !== null && existingIsDigital !== nextIsDigital) {
        return NextResponse.json({ error: 'Product type is immutable. Create a new product for the other store.' }, { status: 400 });
      }
      const category = db.categories.find((current) => current.id === productData.categoryId);
      if (category?.categoryType === 'DIGITAL' && !nextIsDigital) {
        return NextResponse.json({ error: 'Digital categories can only be used by digital products.' }, { status: 400 });
      }
      if (category?.categoryType !== 'DIGITAL' && nextIsDigital) {
        return NextResponse.json({ error: 'Digital products require a digital category.' }, { status: 400 });
      }
      const digitalValidationError = validateDigitalProduct(productData);
      if (digitalValidationError) {
        return NextResponse.json({ error: digitalValidationError }, { status: 400 });
      }
      const validatedImages = validateProductImages(productData.images);
      if (!validatedImages) {
        return NextResponse.json(
          { error: 'Images must be up to 8 JPG, JPEG, PNG, or WEBP files (5 MB each, 20 MB total), or valid HTTP(S) URLs.' },
          { status: 400 }
        );
      }
      productData.images = validatedImages;
      if (productData.fulfillmentType === 'AFFILIATE') {
        const affiliateDetails = productData.affiliateDetails;
        const affiliateUrl = affiliateDetails?.affiliateUrl;
        const merchantName = affiliateDetails?.merchantName?.trim();
        const platform = affiliateDetails?.platform;
        let parsedAffiliateUrl: URL | null = null;
        try {
          parsedAffiliateUrl = affiliateUrl ? new URL(affiliateUrl) : null;
        } catch {
          parsedAffiliateUrl = null;
        }
        if (
          !parsedAffiliateUrl ||
          !['http:', 'https:'].includes(parsedAffiliateUrl.protocol) ||
          !parsedAffiliateUrl.hostname ||
          !merchantName ||
          !platform ||
          (productData.status === 'ACTIVE' && parsedAffiliateUrl.protocol !== 'https:')
        ) {
          return NextResponse.json(
            { error: 'Affiliate products require a valid HTTPS URL, platform, and merchant name.' },
            { status: 400 }
          );
        }
        productData.affiliateDetails = {
          ...affiliateDetails,
          affiliateUrl: parsedAffiliateUrl.toString(),
          merchantName,
          platform,
        };
        productData.inventorySource = 'OWNED';
        productData.stockQuantity = 0;
        delete productData.supplierId;
        delete productData.supplierMapping;
      } else if (!nextIsDigital && productData.fulfillmentType === 'DROPSHIP') {
        const mapping = productData.supplierMapping;
        if (
          !productData.supplierId?.trim() ||
          !mapping?.supplierSku?.trim() ||
          !Number.isFinite(mapping.supplierCost) ||
          mapping.supplierCost < 0 ||
          !Number.isSafeInteger(mapping.supplierStock) ||
          mapping.supplierStock < 0
        ) {
          return NextResponse.json(
            { error: 'Dropship products require a supplier, supplier SKU, non-negative supplier cost, and whole-number available stock.' },
            { status: 400 }
          );
        }
        productData.supplierId = productData.supplierId.trim();
        productData.supplierMapping = {
          ...mapping,
          supplierId: productData.supplierId,
          supplierSku: mapping.supplierSku.trim(),
          lastStockSync: mapping.lastStockSync || null,
        };
        productData.costPrice = mapping.supplierCost;
        productData.inventorySource = 'SUPPLIER';
        productData.stockQuantity = mapping.supplierStock;
      } else if (!nextIsDigital && productData.fulfillmentType === 'DIRECT') {
        if (!Number.isSafeInteger(productData.stockQuantity) || productData.stockQuantity < 0) {
          return NextResponse.json(
            { error: 'Own-stock inventory must be a non-negative whole number.' },
            { status: 400 }
          );
        }
        if (productData.costPrice !== undefined && (!Number.isFinite(productData.costPrice) || productData.costPrice < 0)) {
          return NextResponse.json({ error: 'Unit cost must be a non-negative number.' }, { status: 400 });
        }
        productData.inventorySource = 'OWNED';
        delete productData.supplierId;
        delete productData.supplierMapping;
      } else if (!nextIsDigital && !productData.fulfillmentType) {
        productData.fulfillmentType = 'DROPSHIP';
      }

      productData.updatedAt = now;
      if (!productData.id) {
        productData.id = `prod-${Date.now()}`;
        productData.createdAt = now;
        db.products.unshift(productData);
      } else {
        const index = db.products.findIndex((p) => p.id === productData.id);
        if (index >= 0) {
          db.products[index] = { ...db.products[index], ...productData };
        } else {
          productData.createdAt = now;
          db.products.unshift(productData);
        }
      }

      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, product: productData });
    }

    if (action === 'duplicate_product') {
      const { productId } = body;
      const original = db.products.find((p) => p.id === productId);
      if (!original) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

      const copy: Product = {
        ...JSON.parse(JSON.stringify(original)),
        id: `prod-${Date.now()}`,
        slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
        title: `${original.title} (Copy)`,
        sku: `${original.sku}-COPY`,
        status: 'DRAFT',
        createdAt: now,
        updatedAt: now,
      };

      db.products.unshift(copy);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, product: copy });
    }

    if (action === 'delete_product') {
      const { productId } = body;
      if (typeof productId !== 'string' || !productId.trim()) {
        return NextResponse.json({ error: 'A product ID is required.' }, { status: 400 });
      }
      if (!db.products.some((product) => product.id === productId)) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }
      db.products = db.products.filter((p) => p.id !== productId);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true });
    }

    // ─── 1-CLICK SUPPLIER PRODUCT IMPORT ───────────────────────────
    if (action === 'import_supplier_product') {
      const { supplierCatalogItemId, customPrice } = body;
      const item = db.supplierCatalog.find((sc) => sc.id === supplierCatalogItemId);
      if (!item) return NextResponse.json({ error: 'Supplier catalog item not found' }, { status: 404 });

      const slugBase = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

      const generatedSku = `FN-${slugBase.slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const sellingPrice = Number(customPrice || item.suggestedRetailPrice || Math.round(item.supplierCost * 2));

      // Find or assign category
      let categoryId = 'cat-home-living';
      const matchedCat = db.categories.find(
        (c) => c.name.toLowerCase() === item.category.toLowerCase()
      );
      if (matchedCat) categoryId = matchedCat.id;

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
        title: item.title,
        shortDescription: item.description.slice(0, 100),
        description: item.description,
        categoryId,
        collectionIds: ['col-new-arrivals'],
        brand: 'FeelsNeat',
        tags: [item.category, 'Imported'],
        sku: generatedSku,
        sellingPrice,
        compareAtPrice: Math.round(sellingPrice * 1.4),
        costPrice: item.supplierCost,
        images: item.images,
        hasVariants: Array.isArray(item.variants) && item.variants.length > 0,
        variants: Array.isArray(item.variants)
          ? item.variants.map((v, idx) => ({
              id: `var-${Date.now()}-${idx}`,
              productId: `prod-${Date.now()}`,
              sku: `${generatedSku}-${idx + 1}`,
              title: v.title,
              attributes: v.attributes,
              sellingPrice,
              compareAtPrice: Math.round(sellingPrice * 1.4),
              costPrice: v.supplierCost,
              stockQuantity: v.supplierStock,
              supplierSku: v.supplierSku,
              supplierMapping: {
                supplierId: item.supplierId,
                supplierSku: v.supplierSku,
                supplierCost: v.supplierCost,
                supplierStock: v.supplierStock,
                lastStockSync: now,
                fulfillmentEnabled: true,
                syncStatus: 'SYNCED',
              },
              active: true,
            }))
          : [],
        status: 'DRAFT', // Crucial rule: imported products become DRAFT first!
        weightGrams: item.weightGrams,
        dimensions: item.dimensions,
        taxIncluded: true,
        inventorySource: 'SUPPLIER',
        stockQuantity: item.supplierStock,
        supplierId: item.supplierId,
        supplierMapping: {
          supplierId: item.supplierId,
          supplierProductId: item.id,
          supplierSku: item.supplierSku,
          supplierCost: item.supplierCost,
          supplierStock: item.supplierStock,
          lastStockSync: now,
          fulfillmentEnabled: true,
          syncStatus: 'SYNCED',
        },
        seoTitle: `${item.title} | FeelsNeat`,
        seoDescription: item.description.slice(0, 150),
        createdAt: now,
        updatedAt: now,
      };

      db.products.unshift(newProduct);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, product: newProduct });
    }

    // ─── CATEGORY & COLLECTION ACTIONS ─────────────────────────────
    if (action === 'save_category') {
      const category: Category = body.category;
      if (!category.id) category.id = `cat-${Date.now()}`;
      const idx = db.categories.findIndex((c) => c.id === category.id);
      if (idx >= 0) db.categories[idx] = category;
      else db.categories.push(category);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, category });
    }

    if (action === 'delete_category') {
      const { categoryId } = body;
      db.categories = db.categories.filter((c) => c.id !== categoryId);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true });
    }

    if (action === 'save_collection') {
      const collection: Collection = body.collection;
      if (!collection.id) collection.id = `col-${Date.now()}`;
      const idx = db.collections.findIndex((c) => c.id === collection.id);
      if (idx >= 0) db.collections[idx] = collection;
      else db.collections.push(collection);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, collection });
    }

    if (action === 'delete_collection') {
      const { collectionId } = body;
      db.collections = db.collections.filter((c) => c.id !== collectionId);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true });
    }

    // ─── ORDER ACTIONS & MANUAL CONTROLS ───────────────────────────
    if (action === 'update_order_status') {
      const { orderId, orderStatus, paymentStatus, fulfillmentStatus, notes, shipment } = body;
      const order = db.orders.find((o) => o.id === orderId);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
        const payment = db.payments.find((p) => p.orderId === orderId);
        if (payment) {
          payment.status = paymentStatus;
          payment.updatedAt = now;
          if (paymentStatus === 'PAID') payment.paidAt = payment.paidAt || now;
        }
      }
      if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
      if (shipment) {
        order.shipment = {
          ...(order.shipment || {}),
          ...shipment,
          id: order.shipment?.id || `SHP-${order.orderNumber}`,
          fulfillmentOrderId: order.fulfillmentId || `FUL-${order.orderNumber}`,
          orderId,
          createdAt: order.shipment?.createdAt || now,
          updatedAt: now,
        };
      }

      order.timeline.push({
        id: `evt-${Date.now()}`,
        orderId,
        event: `Order Updated`,
        timestamp: now,
        source: 'ADMIN',
        actor: 'Admin',
        notes: notes || 'Admin updated order status manually.',
      });

      order.updatedAt = now;
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, order });
    }

    if (action === 'process_refund') {
      const { orderId, amount, reason = 'Admin requested refund' } = body;
      const order = db.orders.find((o) => o.id === orderId);
      const payment = db.payments.find((p) => p.orderId === orderId);
      if (!order || !payment) return NextResponse.json({ error: 'Order or payment not found' }, { status: 404 });
      if (payment.status !== 'PAID') return NextResponse.json({ error: 'Only paid orders can be refunded.' }, { status: 400 });

      const refundAmount = Number(amount || payment.amount);
      if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > payment.amount) {
        return NextResponse.json({ error: 'Refund amount must be greater than zero and no more than the paid amount.' }, { status: 400 });
      }

      const provider = getPaymentProvider(payment.provider);
      const result = await provider.processRefund(payment.providerPaymentId || payment.providerOrderId || payment.id, refundAmount, reason);
      const refund = {
        id: `RF-${Date.now()}`,
        orderId,
        paymentId: payment.id,
        amount: refundAmount,
        type: refundAmount === payment.amount ? 'FULL' as const : 'PARTIAL' as const,
        status: result.success ? (result.status === 'PROCESSED' ? 'PROCESSED' as const : 'PENDING' as const) : 'FAILED' as const,
        reason,
        gatewayRefundId: result.refundId,
        processedAt: result.success && result.status === 'PROCESSED' ? now : null,
        createdAt: now,
      };
      db.refunds.unshift(refund);
      payment.refundStatus = refund.status;
      payment.refundAmount = (payment.refundAmount || 0) + refundAmount;
      if (refund.status === 'PROCESSED' && payment.refundAmount >= payment.amount) {
        payment.status = 'REFUNDED';
        order.paymentStatus = 'REFUNDED';
        order.orderStatus = 'REFUNDED';
      }
      order.timeline.push({
        id: `evt-${Date.now()}`,
        orderId,
        event: refund.status === 'FAILED' ? 'Refund Failed' : 'Refund Requested',
        timestamp: now,
        source: 'ADMIN',
        actor: 'Admin',
        notes: `${reason} Amount: ₹${refundAmount}.`,
      });
      order.updatedAt = now;
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: result.success, refund, order, providerResult: result });
    }

    if (action === 'add_order_note') {
      const { orderId, note, author = 'Admin' } = body;
      const order = db.orders.find((o) => o.id === orderId);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      order.adminNotes.unshift({
        id: `note-${Date.now()}`,
        timestamp: now,
        author,
        note,
      });

      order.timeline.push({
        id: `evt-${Date.now()}`,
        orderId,
        event: 'Admin Note Added',
        timestamp: now,
        source: 'ADMIN',
        actor: author,
        notes: note,
      });

      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, order });
    }

    if (action === 'retry_fulfillment') {
      const { orderId } = body;
      const order = db.orders.find((o) => o.id === orderId);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const fulfillmentProvider = getFulfillmentProvider('ALISHIPPING');
      const fulfillmentItems = order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        supplierSku: item.supplierSku || item.sku,
        quantity: item.quantity,
        supplierCost: item.supplierCost || 0,
      }));

      const res = await fulfillmentProvider.createFulfillmentOrder({
        order,
        items: fulfillmentItems,
      });

      if (res.success) {
        order.fulfillmentStatus = res.status;
        if (res.trackingNumber && res.courier) {
          const shipment = {
            id: `SHP-${order.orderNumber}`,
            fulfillmentOrderId: order.fulfillmentId || `FUL-${order.orderNumber}`,
            orderId: order.id,
            courier: res.courier,
            trackingNumber: res.trackingNumber,
            trackingUrl: res.trackingUrl,
            shipmentStatus: 'IN_TRANSIT',
            shippedAt: now,
            createdAt: now,
            updatedAt: now,
          };
          db.shipments.unshift(shipment);
          order.shipment = shipment;
        }

        order.timeline.push({
          id: `evt-${Date.now()}`,
          orderId,
          event: 'Fulfillment Order Created (Admin Retry)',
          timestamp: now,
          source: 'ADMIN',
          actor: 'Admin',
          notes: `Fulfillment successfully dispatched to ${fulfillmentProvider.name}.`,
        });
      } else {
        order.timeline.push({
          id: `evt-${Date.now()}`,
          orderId,
          event: 'Fulfillment Retry Failed',
          timestamp: now,
          source: 'ADMIN',
          actor: 'Admin',
          notes: res.error || 'Provider rejected fulfillment request.',
        });
      }

      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: res.success, result: res, order });
    }

    // ─── DISCOUNT ACTIONS ──────────────────────────────────────────
    if (action === 'save_discount') {
      const discount: Discount = body.discount;
      if (!discount.id) {
        discount.id = `disc-${Date.now()}`;
        discount.createdAt = now;
        discount.usageCount = 0;
        db.discounts.unshift(discount);
      } else {
        const idx = db.discounts.findIndex((d) => d.id === discount.id);
        if (idx >= 0) db.discounts[idx] = discount;
        else db.discounts.unshift(discount);
      }
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, discount });
    }

    if (action === 'delete_discount') {
      const { discountId } = body;
      db.discounts = db.discounts.filter((d) => d.id !== discountId);
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true });
    }

    // ─── SETTINGS ──────────────────────────────────────────────────
    if (action === 'save_settings') {
      db.settings = { ...db.settings, ...(body.settings || {}) };
      await saveEcommerceDb(req.url, db);
      return NextResponse.json({ success: true, settings: db.settings });
    }

    return NextResponse.json({ error: 'Unknown admin action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin Ecommerce POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The ecommerce admin request failed.' },
      { status: 500 }
    );
  }
}
