import {
  PaymentProvider,
  CreatePaymentOrderInput,
  PaymentOrderResult,
  PaymentVerificationResult,
  WebhookEventPayload,
  RefundResult,
} from './provider';

export class RazorpayPaymentProvider implements PaymentProvider {
  name = 'RAZORPAY';

  private get keyId(): string | undefined {
    return process.env.RAZORPAY_KEY_ID;
  }

  private get keySecret(): string | undefined {
    return process.env.RAZORPAY_KEY_SECRET;
  }

  private get webhookSecret(): string | undefined {
    return process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret;
  }

  isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  async verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    if (!this.keySecret) return false;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.keySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const digest = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(`${orderId}|${paymentId}`)
    );
    const computed = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    return computed === signature;
  }

  private authHeader(): string {
    return `Basic ${btoa(`${this.keyId}:${this.keySecret}`)}`;
  }

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    if (!this.isConfigured()) {
      throw new Error('Razorpay is not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.');
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(input.order.total * 100),
        currency: 'INR',
        receipt: input.order.id,
        notes: {
          customer_email: input.order.customer.email,
          return_url: input.returnUrl,
          notify_url: input.notifyUrl || '',
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Razorpay order creation failed: ${data.error?.description || JSON.stringify(data)}`);
    }

    return {
      providerOrderId: data.id,
      paymentSessionId: data.id,
      rawResponse: data,
    };
  }

  async verifyPayment(providerOrderId: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) throw new Error('Razorpay is not configured.');
    const res = await fetch(`https://api.razorpay.com/v1/orders/${providerOrderId}/payments`, {
      headers: { Authorization: this.authHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Razorpay payment verification failed: ${JSON.stringify(data)}`);
    const payments = Array.isArray(data.items) ? data.items : [];
    const successful = payments.find((payment: any) => payment.status === 'captured');
    if (successful) {
      return {
        status: 'PAID',
        providerPaymentId: successful.id,
        paymentMethod: successful.method || 'ONLINE',
        amount: Number(successful.amount || 0) / 100,
        paidAt: new Date((successful.created_at || Date.now() / 1000) * 1000).toISOString(),
        rawResponse: successful,
      };
    }
    return { status: payments.some((payment: any) => payment.status === 'failed') ? 'FAILED' : 'PENDING', amount: 0, rawResponse: data };
  }

  async verifyWebhookSignature(headers: Record<string, string>, rawBody: string): Promise<boolean> {
    const signature = headers['x-razorpay-signature'];
    if (!signature || !this.webhookSecret) return false;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
    const computed = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    return computed === signature;
  }

  parseWebhookEvent(rawBody: string): WebhookEventPayload | null {
    try {
      const event = JSON.parse(rawBody);
      const payment = event.payload?.payment?.entity || {};
      const order = event.payload?.order?.entity || {};
      const eventName = String(event.event || '').toLowerCase();
      const status = eventName === 'payment.captured' || payment.status === 'captured'
        ? 'PAID'
        : eventName.includes('failed') || payment.status === 'failed'
          ? 'FAILED'
          : 'PENDING';
      return {
        orderId: order.receipt || payment.notes?.order_id || payment.notes?.orderId || '',
        providerOrderId: payment.order_id || order.id || '',
        providerPaymentId: payment.id,
        paymentStatus: status,
        amount: Number(payment.amount || order.amount || 0) / 100,
        currency: payment.currency || order.currency || 'INR',
        paymentMethod: payment.method || 'ONLINE',
        eventTime: new Date((event.created_at || Date.now() / 1000) * 1000).toISOString(),
        rawEvent: event,
      };
    } catch {
      return null;
    }
  }

  async processRefund(paymentId: string, amount: number, reason: string): Promise<RefundResult> {
    if (!this.isConfigured()) return { success: false, status: 'FAILED', error: 'Razorpay credentials not configured.' };
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: { Authorization: this.authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(amount * 100), notes: { reason } }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, status: 'FAILED', error: data.error?.description || 'Refund request failed', rawResponse: data };
    return { success: true, refundId: data.id, status: data.status === 'processed' ? 'PROCESSED' : 'PENDING', rawResponse: data };
  }
}
