export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'UNPUBLISHED' | 'ARCHIVED';

export type InventorySource = 'OWNED' | 'SUPPLIER';

export type FulfillmentType = 'DROPSHIP' | 'AFFILIATE' | 'DIRECT';

export type AffiliatePlatform = 'AMAZON' | 'ETSY' | 'NOTION' | 'GUMROAD' | 'MANUFACTURER' | 'CUSTOM';

export interface AffiliateDetails {
  affiliateUrl: string; // The destination tracked referral link
  platform: AffiliatePlatform;
  merchantName: string; // e.g. "Amazon India", "Keychron", "Etsy"
  buttonText?: string; // e.g. "Buy on Amazon", "View Deal"
  commissionRatePercent?: number; // e.g. 5 for 5% commission
  clickCount?: number; // Outbound click tracking counter
  disclaimerText?: string; // Custom affiliate disclosure note
}

export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface SupplierProductMapping {
  supplierId: string;
  supplierProductId?: string;
  supplierSku: string;
  supplierCost: number; // in INR
  supplierStock: number;
  lastStockSync: string | null;
  fulfillmentEnabled: boolean;
  syncStatus: 'SYNCED' | 'PENDING' | 'ERROR';
  syncError?: string | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string; // FeelsNeat internal SKU, e.g. FN-LAMP-001-BLK
  title: string; // e.g. "Black / Large"
  attributes: Record<string, string>; // e.g. { Color: "Black", Size: "L" }
  sellingPrice: number; // in INR
  compareAtPrice?: number; // in INR
  costPrice?: number; // supplier or internal cost
  weightGrams?: number;
  stockQuantity: number;
  supplierSku?: string;
  supplierMapping?: SupplierProductMapping;
  image?: string;
  active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  collectionIds: string[];
  brand?: string;
  tags: string[];
  sku: string; // FeelsNeat internal SKU, e.g. FN-LAMP-001
  sellingPrice: number; // in INR (or Reference Price for affiliate products)
  compareAtPrice?: number; // in INR
  costPrice?: number; // in INR (supplier cost or internal cost)
  images: string[];
  hasVariants: boolean;
  variants: ProductVariant[];
  status: ProductStatus;
  fulfillmentType?: FulfillmentType; // 'DROPSHIP' | 'AFFILIATE' | 'DIRECT' (defaults to 'DROPSHIP')
  affiliateDetails?: AffiliateDetails;
  weightGrams?: number;
  dimensions?: ProductDimensions;
  taxRatePercent?: number;
  taxIncluded: boolean;
  inventorySource: InventorySource;
  stockQuantity: number; // For simple products or sum of variants
  supplierId?: string;
  supplierMapping?: SupplierProductMapping;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null; // For hierarchical categories
  image?: string;
  order: number;
  active: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
}

export type SupplierProviderType = 'ALISHIPPING' | 'FLEXSELL' | 'CUSTOM' | 'MOCK';
export type SupplierIntegrationStatus = 'NOT_CONNECTED' | 'CONNECTED' | 'MOCK' | 'TEST';

export interface Supplier {
  id: string;
  name: string;
  providerType: SupplierProviderType;
  status: 'ACTIVE' | 'INACTIVE';
  config: Record<string, any>;
  integrationStatus: SupplierIntegrationStatus;
  createdAt: string;
  updatedAt: string;
}

// Supplier catalog items ready for admin to review and 1-click import as FeelsNeat draft products
export interface SupplierCatalogItem {
  id: string;
  supplierId: string;
  supplierSku: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  supplierCost: number;
  supplierStock: number;
  weightGrams?: number;
  dimensions?: ProductDimensions;
  variants?: Array<{
    supplierSku: string;
    title: string;
    attributes: Record<string, string>;
    supplierCost: number;
    supplierStock: number;
  }>;
  suggestedRetailPrice?: number;
}

export interface CustomerAddress {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItemSnapshot {
  productId: string;
  variantId?: string;
  sku: string; // FeelsNeat SKU
  supplierSku?: string;
  title: string;
  variantTitle?: string;
  unitPrice: number;
  supplierCost?: number;
  quantity: number;
  discount: number;
  tax: number;
  lineTotal: number;
  image?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'FULFILLMENT_PENDING'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURNED'
  | 'REFUNDED'
  | 'RTO'
  | 'DELIVERY_FAILED';

export type PaymentMethod = 'PREPAID' | 'COD';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type FulfillmentStatus =
  | 'NOT_CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RTO'
  | 'RETURNED'
  | 'CANCELLED';

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  event: string;
  timestamp: string;
  source: 'SYSTEM' | 'ADMIN' | 'CASHFREE' | 'ALISHIPPING' | 'CUSTOMER';
  actor: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string; // Internal payment ID, e.g. PAY-10025
  orderId: string;
  provider: 'CASHFREE' | 'COD' | 'MOCK';
  providerOrderId?: string;
  providerPaymentId?: string;
  amount: number;
  currency: 'INR';
  paymentMethod: string; // UPI, CARD, NETBANKING, COD
  status: PaymentStatus;
  gatewayResponse?: any;
  paidAt?: string | null;
  refundStatus?: 'NONE' | 'PENDING' | 'PROCESSED' | 'FAILED';
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FulfillmentOrder {
  id: string; // Internal fulfillment ID, e.g. FUL-10025
  orderId: string;
  supplierId: string;
  providerType: SupplierProviderType;
  providerOrderId?: string | null;
  status: FulfillmentStatus;
  items: Array<{
    productId: string;
    variantId?: string;
    sku: string; // FeelsNeat SKU
    supplierSku: string;
    quantity: number;
    supplierCost: number;
  }>;
  retryCount: number;
  lastError?: string | null;
  shipmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  fulfillmentOrderId: string;
  orderId: string;
  courier: string; // e.g. Delhivery, BlueDart
  trackingNumber: string; // AWB
  trackingUrl?: string;
  shipmentStatus: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstimatedMargin {
  sellingPrice: number;
  supplierCost: number;
  estimatedShipping: number;
  estimatedPaymentFee: number;
  estimatedRtoCost: number;
  estimatedProfit: number;
}

export interface AdminOrderNote {
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

export interface EcommerceOrder {
  id: string; // e.g. FN-10025
  trackingToken?: string;
  orderNumber: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: CustomerAddress;
  billingAddress?: CustomerAddress;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentDetails?: Payment;
  orderStatus: OrderStatus;
  fulfillmentId?: string;
  fulfillmentStatus: FulfillmentStatus;
  fulfillmentDetails?: FulfillmentOrder;
  shipment?: Shipment;
  timeline: OrderTimelineEvent[];
  adminNotes: AdminOrderNote[];
  estimatedMargin?: EstimatedMargin;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number; // e.g. 10 for 10% or 100 for ₹100
  minOrderValue: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  usageCount: number;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'RTO';
  items: Array<{ productId: string; quantity: number }>;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRecord {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  type: 'FULL' | 'PARTIAL';
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  reason: string;
  gatewayRefundId?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface EcommerceSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: 'INR';
  freeShippingThreshold: number;
  standardShippingFee: number;
  codAvailable: boolean;
  codFee: number;
  taxRatePercent: number;
  cashfreeEnvironment: 'TEST' | 'PRODUCTION';
  cashfreeConfigured: boolean;
  aliShippingConfigured: boolean;
  aliShippingStatus: 'NOT_CONNECTED' | 'CONNECTED' | 'MOCK';
  estimatedPaymentFeePercent: number;
  estimatedRtoCostPerOrder: number;
}

export interface EcommerceDb {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  suppliers: Supplier[];
  supplierCatalog: SupplierCatalogItem[];
  orders: EcommerceOrder[];
  payments: Payment[];
  fulfillmentOrders: FulfillmentOrder[];
  shipments: Shipment[];
  discounts: Discount[];
  returns: ReturnRequest[];
  refunds: RefundRecord[];
  settings: EcommerceSettings;
}
