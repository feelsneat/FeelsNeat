import {
  FulfillmentProvider,
  CreateFulfillmentInput,
  FulfillmentOrderResult,
  TrackingInfo,
  InventorySyncItem,
} from './provider';
import { AliShippingProvider } from './alishipping';

export class MockFulfillmentProvider implements FulfillmentProvider {
  name = 'MOCK';
  status: 'MOCK' = 'MOCK';

  async createFulfillmentOrder(input: CreateFulfillmentInput): Promise<FulfillmentOrderResult> {
    const { order } = input;
    const providerOrderId = `ALI-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    return {
      success: true,
      providerOrderId,
      status: 'PROCESSING',
      courier: 'Delhivery',
      trackingNumber,
      trackingUrl: `https://www.delhivery.com/track/package/${trackingNumber}`,
      rawResponse: {
        mock: true,
        orderId: order.id,
        itemsCount: input.items.length,
      },
    };
  }

  async cancelFulfillmentOrder(providerOrderId: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async getFulfillmentStatus(providerOrderId: string): Promise<TrackingInfo> {
    const trackingNumber = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return {
      courier: 'Delhivery',
      trackingNumber,
      trackingUrl: `https://www.delhivery.com/track/package/${trackingNumber}`,
      status: 'SHIPPED',
      statusDescription: 'In transit to destination hub',
      shippedAt: new Date().toISOString(),
      rawResponse: { mock: true, providerOrderId },
    };
  }

  async syncInventory(supplierSkus: string[]): Promise<Record<string, InventorySyncItem>> {
    const result: Record<string, InventorySyncItem> = {};
    supplierSkus.forEach((sku) => {
      result[sku] = {
        supplierSku: sku,
        stock: 50,
        available: true,
      };
    });
    return result;
  }
}

export function getFulfillmentProvider(providerType?: string): FulfillmentProvider {
  if (providerType?.toUpperCase() === 'ALISHIPPING') {
    return new AliShippingProvider();
  }
  return new MockFulfillmentProvider();
}
