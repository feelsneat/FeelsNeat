import {
  FulfillmentProvider,
  CreateFulfillmentInput,
  FulfillmentOrderResult,
  TrackingInfo,
  InventorySyncItem,
} from './provider';

/**
 * AliShipping Fulfillment Provider Boundary
 *
 * NOTE: As per architectural requirements, official AliShipping API documentation and credentials
 * are not yet present in the codebase. We do not invent fake endpoints, authentication schemas,
 * or tracking response structures.
 *
 * This provider implements the integration boundary cleanly and reports 'NOT_CONNECTED'.
 * Once official API documentation is provided, the methods below can be implemented
 * against the real endpoints without touching products, orders, or checkout flows.
 */
export class AliShippingProvider implements FulfillmentProvider {
  name = 'ALISHIPPING';

  get status(): 'NOT_CONNECTED' | 'CONNECTED' {
    const hasKey = Boolean(process.env.ALISHIPPING_API_KEY && process.env.ALISHIPPING_API_SECRET);
    return hasKey ? 'CONNECTED' : 'NOT_CONNECTED';
  }

  async createFulfillmentOrder(input: CreateFulfillmentInput): Promise<FulfillmentOrderResult> {
    if (this.status !== 'CONNECTED') {
      return {
        success: false,
        status: 'FAILED',
        error: 'AliShipping is not connected. Official API credentials have not been configured in environment variables (ALISHIPPING_API_KEY, ALISHIPPING_API_SECRET).',
      };
    }

    // TODO: When official AliShipping API documentation is supplied, invoke their order creation endpoint here.
    return {
      success: false,
      status: 'FAILED',
      error: 'AliShipping live API client pending official documentation.',
    };
  }

  async cancelFulfillmentOrder(providerOrderId: string): Promise<{ success: boolean; error?: string }> {
    if (this.status !== 'CONNECTED') {
      return { success: false, error: 'AliShipping is not connected.' };
    }
    return { success: false, error: 'AliShipping cancel operation pending official documentation.' };
  }

  async getFulfillmentStatus(providerOrderId: string): Promise<TrackingInfo> {
    if (this.status !== 'CONNECTED') {
      throw new Error('AliShipping is not connected.');
    }
    throw new Error('AliShipping tracking query pending official documentation.');
  }

  async syncInventory(supplierSkus: string[]): Promise<Record<string, InventorySyncItem>> {
    if (this.status !== 'CONNECTED') {
      throw new Error('AliShipping is not connected.');
    }
    return {};
  }
}
