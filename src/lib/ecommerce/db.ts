import {
  EcommerceDb,
  Product,
  Category,
  Collection,
  Supplier,
  SupplierCatalogItem,
  Discount,
  EcommerceSettings,
} from './types';

export const initialEcommerceSettings: EcommerceSettings = {
  storeName: 'FeelsNeat Shop',
  supportEmail: 'hello@feelsneat.com',
  supportPhone: '+91 99999 99999',
  currency: 'INR',
  freeShippingThreshold: 999,
  standardShippingFee: 60,
  codAvailable: true,
  codFee: 40,
  taxRatePercent: 0, // Included in product price
  cashfreeEnvironment: 'TEST',
  cashfreeConfigured: false,
  aliShippingConfigured: false,
  aliShippingStatus: 'NOT_CONNECTED',
  estimatedPaymentFeePercent: 2,
  estimatedRtoCostPerOrder: 30,
};

export const initialCategories: Category[] = [
  {
    id: 'cat-home-living',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Minimalist objects and thoughtful design pieces for intentional living.',
    parentId: null,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800',
    order: 1,
    active: true,
  },
  {
    id: 'cat-lighting',
    name: 'Lighting',
    slug: 'lighting',
    description: 'Ambient wireless and sculptural lighting for calm spaces.',
    parentId: 'cat-home-living',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800',
    order: 2,
    active: true,
  },
  {
    id: 'cat-desk-setup',
    name: 'Desk Setup',
    slug: 'desk-setup',
    description: 'Ergonomic surfaces, cable management, and tactile desk essentials.',
    parentId: 'cat-home-living',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
    order: 3,
    active: true,
  },
  {
    id: 'cat-storage',
    name: 'Storage & Trays',
    slug: 'storage',
    description: 'Everyday carry organizers, valet trays, and modular desktop compartments.',
    parentId: 'cat-home-living',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800',
    order: 4,
    active: true,
  },
];

export const initialCollections: Collection[] = [
  {
    id: 'col-new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Latest minimalist additions to the FeelsNeat collection.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800',
    order: 1,
    active: true,
  },
  {
    id: 'col-best-sellers',
    name: 'Best Sellers',
    slug: 'best-sellers',
    description: 'Most loved objects by our community.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800',
    order: 2,
    active: true,
  },
  {
    id: 'col-trending',
    name: 'Trending',
    slug: 'trending',
    description: 'Currently popular aesthetic workspace upgrades.',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
    order: 3,
    active: true,
  },
  {
    id: 'col-under-999',
    name: 'Under ₹999',
    slug: 'under-999',
    description: 'Accessible designer additions under ₹999.',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800',
    order: 4,
    active: true,
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-alishipping',
    name: 'AliShipping',
    providerType: 'ALISHIPPING',
    status: 'ACTIVE',
    config: {
      warehouse: 'CN-HKG-01',
      courierPartner: 'Delhivery',
    },
    integrationStatus: 'NOT_CONNECTED',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'sup-mock',
    name: 'FeelsNeat Test Warehouse',
    providerType: 'MOCK',
    status: 'ACTIVE',
    config: {
      autoFulfill: false,
    },
    integrationStatus: 'MOCK',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

export const initialSupplierCatalog: SupplierCatalogItem[] = [
  {
    id: 'sc-78392',
    supplierId: 'sup-alishipping',
    supplierSku: 'ALI-78392',
    title: 'Modern Wireless Rechargeable Touch Lamp',
    description: 'Minimalist aluminum rechargeable table lamp with 3 dimming modes and USB-C fast charging.',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800',
    ],
    category: 'Lighting',
    supplierCost: 420,
    supplierStock: 85,
    suggestedRetailPrice: 999,
    weightGrams: 480,
    dimensions: { lengthCm: 12, widthCm: 12, heightCm: 28 },
  },
  {
    id: 'sc-89104',
    supplierId: 'sup-alishipping',
    supplierSku: 'ALI-89104',
    title: 'Magnetic Cable Management Tray & Organizer',
    description: 'Precision molded silicone under-desk and tabletop cable organizers with neodymium magnetic clips.',
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800',
    ],
    category: 'Desk Setup',
    supplierCost: 190,
    supplierStock: 140,
    suggestedRetailPrice: 499,
    weightGrams: 210,
    dimensions: { lengthCm: 15, widthCm: 8, heightCm: 3 },
  },
  {
    id: 'sc-94211',
    supplierId: 'sup-alishipping',
    supplierSku: 'ALI-94211',
    title: 'Minimalist Matte Dual-Sided Desk Mat',
    description: 'Spill-resistant vegan leather desk blotter with anti-slip suede backing.',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
    ],
    category: 'Desk Setup',
    supplierCost: 310,
    supplierStock: 95,
    suggestedRetailPrice: 799,
    weightGrams: 350,
    dimensions: { lengthCm: 80, widthCm: 40, heightCm: 0.2 },
    variants: [
      {
        supplierSku: 'ALI-94211-BLK',
        title: 'Matte Black',
        attributes: { Color: 'Matte Black' },
        supplierCost: 310,
        supplierStock: 45,
      },
      {
        supplierSku: 'ALI-94211-GRY',
        title: 'Slate Grey',
        attributes: { Color: 'Slate Grey' },
        supplierCost: 310,
        supplierStock: 50,
      },
    ],
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-modern-wireless-lamp',
    slug: 'modern-wireless-table-lamp',
    title: 'Modern Wireless Table Lamp',
    shortDescription: 'Cordless touch-dimmable warm ambient light with 24-hour battery life.',
    description: `A masterclass in quiet elegance. The FeelsNeat Modern Wireless Table Lamp offers warm 2700K ambient illumination without unsightly cords.
    
Engineered with an aviation-grade aluminum unibody, stepless capacitive touch dimming, and a high-density rechargeable battery that provides up to 24 hours of continuous glow on a single USB-C charge.
    
Perfect for nightstands, coffee tables, dining settings, or reading nooks.`,
    categoryId: 'cat-lighting',
    collectionIds: ['col-new-arrivals', 'col-best-sellers'],
    brand: 'FeelsNeat',
    tags: ['Lighting', 'Minimalist', 'Wireless', 'Rechargeable', 'Desk'],
    sku: 'FN-LAMP-001',
    sellingPrice: 999,
    compareAtPrice: 1499,
    costPrice: 420,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1200',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200',
    ],
    hasVariants: false,
    variants: [],
    status: 'ACTIVE',
    weightGrams: 480,
    dimensions: { lengthCm: 12, widthCm: 12, heightCm: 28 },
    taxIncluded: true,
    inventorySource: 'SUPPLIER',
    stockQuantity: 85,
    supplierId: 'sup-alishipping',
    supplierMapping: {
      supplierId: 'sup-alishipping',
      supplierProductId: 'sc-78392',
      supplierSku: 'ALI-78392',
      supplierCost: 420,
      supplierStock: 85,
      lastStockSync: '2026-09-15T12:00:00.000Z',
      fulfillmentEnabled: true,
      syncStatus: 'SYNCED',
    },
    fulfillmentType: 'DROPSHIP',
    seoTitle: 'Modern Wireless Table Lamp | Minimalist Ambient Light | FeelsNeat',
    seoDescription: 'Cordless touch-dimmable warm ambient lamp crafted in matte aluminum. 24h battery, USB-C rechargeable.',
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'prod-minimalist-desk-mat',
    slug: 'minimalist-desk-mat',
    title: 'Minimalist Desk Mat',
    shortDescription: 'Dual-sided vegan leather workspace blotter with waterproof finish.',
    description: `Redefine your workspace with the FeelsNeat Minimalist Desk Mat. Crafted with premium textured vegan leather on the front and non-slip felt suede on the reverse.
    
Provides smooth precision tracking for optical mice, cushions your wrists during long focus sessions, and protects your desk surface from scratches and hot mugs.`,
    categoryId: 'cat-desk-setup',
    collectionIds: ['col-best-sellers', 'col-under-999'],
    brand: 'FeelsNeat',
    tags: ['Desk Setup', 'Workspace', 'Accessories', 'Vegan Leather'],
    sku: 'FN-MAT-001',
    sellingPrice: 799,
    compareAtPrice: 1199,
    costPrice: 310,
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200',
    ],
    hasVariants: true,
    variants: [
      {
        id: 'var-mat-blk-l',
        productId: 'prod-minimalist-desk-mat',
        sku: 'FN-MAT-001-BLK',
        title: 'Matte Black / Large (80x40cm)',
        attributes: { Color: 'Matte Black', Size: 'Large (80x40cm)' },
        sellingPrice: 799,
        compareAtPrice: 1199,
        costPrice: 310,
        weightGrams: 350,
        stockQuantity: 45,
        supplierSku: 'ALI-94211-BLK',
        supplierMapping: {
          supplierId: 'sup-alishipping',
          supplierSku: 'ALI-94211-BLK',
          supplierCost: 310,
          supplierStock: 45,
          lastStockSync: '2026-09-15T12:00:00.000Z',
          fulfillmentEnabled: true,
          syncStatus: 'SYNCED',
        },
        active: true,
      },
      {
        id: 'var-mat-gry-l',
        productId: 'prod-minimalist-desk-mat',
        sku: 'FN-MAT-001-GRY',
        title: 'Slate Grey / Large (80x40cm)',
        attributes: { Color: 'Slate Grey', Size: 'Large (80x40cm)' },
        sellingPrice: 799,
        compareAtPrice: 1199,
        costPrice: 310,
        weightGrams: 350,
        stockQuantity: 50,
        supplierSku: 'ALI-94211-GRY',
        supplierMapping: {
          supplierId: 'sup-alishipping',
          supplierSku: 'ALI-94211-GRY',
          supplierCost: 310,
          supplierStock: 50,
          lastStockSync: '2026-09-15T12:00:00.000Z',
          fulfillmentEnabled: true,
          syncStatus: 'SYNCED',
        },
        active: true,
      },
    ],
    status: 'ACTIVE',
    weightGrams: 350,
    dimensions: { lengthCm: 80, widthCm: 40, heightCm: 0.2 },
    taxIncluded: true,
    inventorySource: 'SUPPLIER',
    stockQuantity: 95,
    supplierId: 'sup-alishipping',
    supplierMapping: {
      supplierId: 'sup-alishipping',
      supplierProductId: 'sc-94211',
      supplierSku: 'ALI-94211',
      supplierCost: 310,
      supplierStock: 95,
      lastStockSync: '2026-09-15T12:00:00.000Z',
      fulfillmentEnabled: true,
      syncStatus: 'SYNCED',
    },
    fulfillmentType: 'DROPSHIP',
    seoTitle: 'Minimalist Desk Mat | Waterproof Vegan Leather Blotter | FeelsNeat',
    seoDescription: 'Premium double-sided desk mat for clean workspace aesthetics and smooth mouse tracking.',
    createdAt: '2026-09-11T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'prod-magnetic-cable-organizer',
    slug: 'magnetic-cable-organizer',
    title: 'Magnetic Cable Management Tray',
    shortDescription: 'Weighted desktop tray with 3 magnetic cable collars for clean desks.',
    description: `Stop picking cables off the floor. The FeelsNeat Magnetic Cable Management Tray keeps charging cables neatly anchored exactly where you need them.
    
Features a solid weighted metal base and 3 modular magnetic collars compatible with USB-C, Lightning, and braided power cords.`,
    categoryId: 'cat-storage',
    collectionIds: ['col-under-999', 'col-trending'],
    brand: 'FeelsNeat',
    tags: ['Cable Management', 'Desk Setup', 'Organization'],
    sku: 'FN-CAB-001',
    sellingPrice: 499,
    compareAtPrice: 799,
    costPrice: 190,
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200',
    ],
    hasVariants: false,
    variants: [],
    status: 'ACTIVE',
    weightGrams: 210,
    dimensions: { lengthCm: 15, widthCm: 8, heightCm: 3 },
    taxIncluded: true,
    inventorySource: 'SUPPLIER',
    stockQuantity: 140,
    supplierId: 'sup-alishipping',
    supplierMapping: {
      supplierId: 'sup-alishipping',
      supplierProductId: 'sc-89104',
      supplierSku: 'ALI-89104',
      supplierCost: 190,
      supplierStock: 140,
      lastStockSync: '2026-09-15T12:00:00.000Z',
      fulfillmentEnabled: true,
      syncStatus: 'SYNCED',
    },
    fulfillmentType: 'DROPSHIP',
    seoTitle: 'Magnetic Cable Management Tray | Desk Cable Organizer | FeelsNeat',
    seoDescription: 'Weighted magnetic cable organizer tray to keep your charging cords organized and accessible.',
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'prod-keychron-k2-keyboard',
    slug: 'keychron-k2-wireless-mechanical-keyboard',
    title: 'Keychron K2 Wireless Mechanical Keyboard',
    shortDescription: 'Tactile 75% Bluetooth mechanical keyboard with Mac & Windows layout switches.',
    description: `A quintessential desk upgrade. The Keychron K2 blends tactile satisfaction with minimalist desktop ergonomics.
    
Engineered with Gateron G Pro mechanical switches, wireless Bluetooth 5.1 multi-device pairing (up to 3 devices), seamless Mac & Windows physical switch toggles, and a massive 4000mAh battery that delivers up to 240 hours of typing.
    
Finished with double-shot keycaps and an anodized aluminum frame for a sturdy, resonance-dampened sound profile.`,
    categoryId: 'cat-desk-setup',
    collectionIds: ['col-trending', 'col-best-sellers'],
    brand: 'Keychron',
    tags: ['Mechanical Keyboard', 'Wireless', 'Desk Setup', 'Productivity'],
    sku: 'FN-KEY-001',
    sellingPrice: 7499,
    compareAtPrice: 8999,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1200',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1200',
    ],
    hasVariants: false,
    variants: [],
    status: 'ACTIVE',
    fulfillmentType: 'AFFILIATE',
    affiliateDetails: {
      affiliateUrl: 'https://www.amazon.in/dp/B07YB32H52?tag=feelsneat-21',
      platform: 'AMAZON',
      merchantName: 'Amazon India',
      buttonText: 'Buy on Amazon ↗',
      commissionRatePercent: 6,
      clickCount: 24,
      disclaimerText: 'FeelsNeat participates in the Amazon Associates Program. As an Amazon Associate, we earn from qualifying purchases at zero additional cost to you.',
    },
    weightGrams: 790,
    dimensions: { lengthCm: 31, widthCm: 12, heightCm: 3.8 },
    taxIncluded: true,
    inventorySource: 'SUPPLIER',
    stockQuantity: 99,
    seoTitle: 'Keychron K2 Wireless Mechanical Keyboard | FeelsNeat Curated Finds',
    seoDescription: 'Curated recommendation: 75% layout Bluetooth mechanical keyboard with Mac/Windows switches.',
    createdAt: '2026-09-16T10:00:00.000Z',
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
  {
    id: 'prod-solid-walnut-monitor-stand',
    slug: 'solid-walnut-artisan-monitor-riser',
    title: 'Artisan Solid Walnut Monitor Riser Stand',
    shortDescription: 'Handcrafted solid American walnut desk shelf with matte black cork-cushioned aluminum legs.',
    description: `Elevate your display to true eye level while reclaiming valuable desktop real estate.
    
Handmade from a single slab of sustainable American black walnut with subtle organic grain variations, sealed with natural hardwax oil for lasting spill and scratch protection.
    
Features integrated cork-backed feet that protect your desk surface and an open undercarriage sized specifically to stow a 16-inch laptop or keyboard when not in use.`,
    categoryId: 'cat-desk-setup',
    collectionIds: ['col-new-arrivals', 'col-best-sellers'],
    brand: 'Artisan Woodcraft',
    tags: ['Walnut', 'Desk Shelf', 'Ergonomics', 'Artisan'],
    sku: 'FN-RIS-001',
    sellingPrice: 4299,
    compareAtPrice: 5499,
    images: [
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=1200',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200',
    ],
    hasVariants: false,
    variants: [],
    status: 'ACTIVE',
    fulfillmentType: 'AFFILIATE',
    affiliateDetails: {
      affiliateUrl: 'https://www.etsy.com/listing/feelsneat-walnut-riser?ref=feelsneat_curated',
      platform: 'ETSY',
      merchantName: 'Etsy Maker Collective',
      buttonText: 'Get on Etsy ↗',
      commissionRatePercent: 8,
      clickCount: 16,
      disclaimerText: 'FeelsNeat curates independent craft and design studios. We may earn a small affiliate commission if you purchase through this link at zero extra cost to you.',
    },
    weightGrams: 1450,
    dimensions: { lengthCm: 50, widthCm: 22, heightCm: 10 },
    taxIncluded: true,
    inventorySource: 'SUPPLIER',
    stockQuantity: 99,
    seoTitle: 'Artisan Solid Walnut Monitor Riser Stand | FeelsNeat Curated Finds',
    seoDescription: 'Handcrafted solid walnut desk shelf with matte aluminum legs. Elevates your screen and organizes your desk.',
    createdAt: '2026-09-17T10:00:00.000Z',
    updatedAt: '2026-09-19T10:00:00.000Z',
  },
];

export const initialDiscounts: Discount[] = [
  {
    id: 'disc-welcome10',
    code: 'WELCOME10',
    discountType: 'PERCENTAGE',
    value: 10,
    minOrderValue: 499,
    maxDiscount: 200,
    active: true,
    usageCount: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'disc-save100',
    code: 'SAVE100',
    discountType: 'FIXED',
    value: 100,
    minOrderValue: 999,
    active: true,
    usageCount: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const emptyEcommerceDb = (includeSeedProducts = process.env.NODE_ENV !== 'production'): EcommerceDb => ({
  products: includeSeedProducts ? initialProducts : [],
  categories: initialCategories,
  collections: initialCollections,
  suppliers: initialSuppliers,
  supplierCatalog: initialSupplierCatalog,
  orders: [],
  payments: [],
  fulfillmentOrders: [],
  shipments: [],
  discounts: initialDiscounts,
  returns: [],
  refunds: [],
  settings: initialEcommerceSettings,
});

export async function loadEcommerceDb(reqUrl: string): Promise<EcommerceDb> {
  let db = emptyEcommerceDb();
  const seedProducts = process.env.NODE_ENV === 'production' ? [] : initialProducts;
  let productionStorageResolved = false;

  const mergeIfDb = (candidate: unknown) => {
    if (
      candidate &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate) &&
      Array.isArray((candidate as Partial<EcommerceDb>).products)
    ) {
      const c = candidate as Partial<EcommerceDb>;
      db = {
        products: Array.isArray(c.products) ? (c.products.length > 0 ? c.products : seedProducts) : seedProducts,
        categories: Array.isArray(c.categories) && c.categories.length > 0 ? c.categories : initialCategories,
        collections: Array.isArray(c.collections) && c.collections.length > 0 ? c.collections : initialCollections,
        suppliers: Array.isArray(c.suppliers) && c.suppliers.length > 0 ? c.suppliers : initialSuppliers,
        supplierCatalog: Array.isArray(c.supplierCatalog) && c.supplierCatalog.length > 0 ? c.supplierCatalog : initialSupplierCatalog,
        orders: Array.isArray(c.orders) ? c.orders : [],
        payments: Array.isArray(c.payments) ? c.payments : [],
        fulfillmentOrders: Array.isArray(c.fulfillmentOrders) ? c.fulfillmentOrders : [],
        shipments: Array.isArray(c.shipments) ? c.shipments : [],
        discounts: Array.isArray(c.discounts) && c.discounts.length > 0 ? c.discounts : initialDiscounts,
        returns: Array.isArray(c.returns) ? c.returns : [],
        refunds: Array.isArray(c.refunds) ? c.refunds : [],
        settings: c.settings ? { ...initialEcommerceSettings, ...c.settings } : initialEcommerceSettings,
      };
    }
  };

  // 1. Production KV Resolution
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;
    if (env && env.FEELSNEAT_CMS_KV) {
      productionStorageResolved = true;
      const val = await env.FEELSNEAT_CMS_KV.get('ecommerce_db');
      if (val) mergeIfDb(JSON.parse(val));
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Ecommerce DB] Production KV read failed:', error);
      throw new Error('Ecommerce data could not be loaded from production storage.');
    }
  }

  // 2. Development Node JSON Dev DB Proxy
  if (process.env.NODE_ENV === 'development') {
    try {
      const res = await fetch(new URL('/api/dev-db?type=ecommerce', reqUrl).toString());
      if (res.ok) {
        mergeIfDb(await res.json());
      }
    } catch (_) {}
  }

  if (process.env.NODE_ENV === 'production' && !productionStorageResolved) {
    throw new Error('Ecommerce production storage is not configured.');
  }

  return db;
}

export async function saveEcommerceDb(reqUrl: string, db: EcommerceDb) {
  let persisted = false;

  // 1. Production KV Resolution
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;
    if (env && env.FEELSNEAT_CMS_KV) {
      await env.FEELSNEAT_CMS_KV.put('ecommerce_db', JSON.stringify(db));
      persisted = true;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Ecommerce DB] Production KV write failed:', error);
      throw new Error('Ecommerce data could not be saved to production storage.');
    }
  }

  // 2. Development Node JSON Dev DB Proxy
  if (process.env.NODE_ENV === 'development') {
    try {
      const response = await fetch(new URL('/api/dev-db?type=ecommerce', reqUrl).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_ecommerce_db', ecommerceData: db }),
      });
      if (!response.ok) {
        throw new Error(`Development ecommerce storage returned ${response.status}.`);
      }
      persisted = true;
    } catch (error) {
      console.error('[Ecommerce DB] Development storage write failed:', error);
      throw new Error('Ecommerce data could not be saved to development storage.');
    }
  }

  if (!persisted) {
    throw new Error('Ecommerce storage is not configured.');
  }
}
