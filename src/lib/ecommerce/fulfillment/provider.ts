import { EcommerceOrder, FulfillmentStatus } from '../types';

export interface FulfillmentItemInput {
  productId: string;
  variantId?: string;
  sku: string; // FeelsNeat SKU
  supplierSku: string; // Supplier SKU mapped
  quantity: number;
  supplierCost: number;
}

export interface CreateFulfillmentInput {
  order: EcommerceOrder;
  items: FulfillmentItemInput[];
}

export interface FulfillmentOrderResult {
  success: boolean;
  providerOrderId?: string;
  status: FulfillmentStatus;
  trackingNumber?: string;
  courier?: string;
  trackingUrl?: string;
  error?: string;
  rawResponse?: any;
}

export interface TrackingInfo {
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: FulfillmentStatus;
  statusDescription?: string;
  shippedAt?: string;
  deliveredAt?: string;
  rawResponse?: any;
}

export interface InventorySyncItem {
  supplierSku: string;
  stock: number;
  cost?: number;
  available: boolean;
}

export interface FulfillmentProvider {
  name: string;
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'MOCK';
  createFulfillmentOrder(input: CreateFulfillmentInput): Promise<FulfillmentOrderResult>;
  cancelFulfillmentOrder(providerOrderId: string): Promise<{ success: boolean; error?: string }>;
  getFulfillmentStatus(providerOrderId: string): Promise<TrackingInfo>;
  syncInventory(supplierSkus: string[]): Promise<Record<string, InventorySyncItem>>;
}
