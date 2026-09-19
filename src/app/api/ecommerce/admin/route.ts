import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { loadEcommerceDb, saveEcommerceDb } from '@/lib/ecommerce/db';
import { Product, Category, Collection, Discount, EcommerceOrder } from '@/lib/ecommerce/types';
import { getPaymentProvider } from '@/lib/ecommerce/payments/mock';
import { getFulfillmentProvider } from '@/lib/ecommerce/fulfillment/mock';

export const runtime = 'edge';

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

    // Compute live operational metrics for Dashboard
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = db.orders.filter((o) => o.createdAt.startsWith(todayStr));
    const paidOrders = db.orders.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const estimatedProfit = paidOrders.reduce(
      (sum, o) => sum + (o.estimatedMargin?.estimatedProfit || 0),
      0
    );

    const affiliateProducts = db.products.filter((p) => p.fulfillmentType === 'AFFILIATE');
    const dropshipProducts = db.products.filter((p) => !p.fulfillmentType || p.fulfillmentType === 'DROPSHIP');
    const totalAffiliateClicks = affiliateProducts.reduce(
      (sum, p) => sum + (p.affiliateDetails?.clickCount || 0),
      0
    );
    const dropshipOrders = db.orders.filter((o) => o.items.some((item) =>
      db.products.find((p) => p.id === item.productId)?.fulfillmentType !== 'AFFILIATE'
    ));
    const dropshipPaidOrders = dropshipOrders.filter((o) => o.paymentStatus === 'PAID' || o.paymentMethod === 'COD');
    const affiliateReferenceValue = affiliateProducts.reduce((sum, p) =>
      sum + ((p.affiliateDetails?.clickCount || 0) * p.sellingPrice), 0
    );

    const metrics = {
      totalOrders: db.orders.length,
      todayOrdersCount: todayOrders.length,
      pendingPaymentCount: db.orders.filter((o) => o.paymentStatus === 'PENDING').length,
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
      cashfreeConfigured: Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET),
      aliShippingConfigured: Boolean(process.env.ALISHIPPING_API_KEY && process.env.ALISHIPPING_API_SECRET),
    };

    return NextResponse.json({
      ...db,
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
    const body = await req.json();
    const { action } = body;
    const db = await loadEcommerceDb(req.url);
    const now = new Date().toISOString();

    // ─── PRODUCT ACTIONS ──────────────────────────────────────────
    if (action === 'save_product' || action === 'save_affiliate_product') {
      const productData: Product = {
        ...body.product,
        ...(action === 'save_affiliate_product' ? { fulfillmentType: 'AFFILIATE' } : {}),
      };
      if (!productData || !productData.title || !productData.sku) {
        return NextResponse.json({ error: 'Product title and SKU are required.' }, { status: 400 });
      }
      if (productData.fulfillmentType === 'AFFILIATE') {
        const affiliateUrl = productData.affiliateDetails?.affiliateUrl;
        if (!affiliateUrl || !/^https?:\/\//i.test(affiliateUrl)) {
          return NextResponse.json({ error: 'A valid affiliate URL is required.' }, { status: 400 });
        }
        productData.inventorySource = 'OWNED';
        productData.stockQuantity = 0;
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
