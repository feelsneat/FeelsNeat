import {
  PaymentProvider,
  CreatePaymentOrderInput,
  PaymentOrderResult,
  PaymentVerificationResult,
  WebhookEventPayload,
  RefundResult,
} from './provider';

export class MockPaymentProvider implements PaymentProvider {
  name = 'MOCK';

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    const { order, returnUrl } = input;
    const providerOrderId = `MOCK-ORD-${order.id}`;
    const paymentSessionId = `mock_sess_${Date.now()}`;
    return {
      providerOrderId,
      paymentSessionId,
      paymentUrl: `${returnUrl}?mock_payment=true&order_id=${order.id}`,
      rawResponse: { mock: true, orderId: order.id },
    };
  }

  async verifyPayment(providerOrderId: string): Promise<PaymentVerificationResult> {
    return {
      status: 'PAID',
      providerPaymentId: `mock_pay_${Date.now()}`,
      paymentMethod: 'UPI (Sandbox Mock)',
      amount: 999,
      paidAt: new Date().toISOString(),
      rawResponse: { mock: true, verified: true },
    };
  }

  async verifyWebhookSignature(headers: Record<string, string>, rawBody: string): Promise<boolean> {
    return true;
  }

  parseWebhookEvent(rawBody: string): WebhookEventPayload | null {
    try {
      const data = JSON.parse(rawBody);
      return {
        orderId: data.orderId || 'FN-MOCK',
        providerOrderId: data.providerOrderId || 'MOCK-ORD',
        providerPaymentId: data.providerPaymentId || 'MOCK-PAY',
        paymentStatus: data.status || 'PAID',
        amount: data.amount || 0,
        currency: 'INR',
        paymentMethod: 'UPI',
        eventTime: new Date().toISOString(),
        rawEvent: data,
      };
    } catch {
      return null;
    }
  }

  async processRefund(paymentId: string, amount: number, reason: string): Promise<RefundResult> {
    return {
      success: true,
      refundId: `mock_rfnd_${Date.now()}`,
      status: 'PROCESSED',
      rawResponse: { mock: true, amount, reason },
    };
  }
}

export function getPaymentProvider(providerName?: string): PaymentProvider {
  if (providerName?.toUpperCase() === 'CASHFREE') {
    const { CashfreePaymentProvider } = require('./cashfree');
    return new CashfreePaymentProvider();
  }
  return new MockPaymentProvider();
}
