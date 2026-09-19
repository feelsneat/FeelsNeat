import {
  PaymentProvider,
  CreatePaymentOrderInput,
  PaymentOrderResult,
  PaymentVerificationResult,
  WebhookEventPayload,
  RefundResult,
} from './provider';

export class CashfreePaymentProvider implements PaymentProvider {
  name = 'CASHFREE';

  private get clientId(): string | undefined {
    return process.env.CASHFREE_CLIENT_ID;
  }

  private get clientSecret(): string | undefined {
    return process.env.CASHFREE_CLIENT_SECRET;
  }

  private get environment(): 'TEST' | 'PRODUCTION' {
    return (process.env.CASHFREE_ENVIRONMENT?.toUpperCase() === 'PRODUCTION')
      ? 'PRODUCTION'
      : 'TEST';
  }

  private get baseUrl(): string {
    return this.environment === 'PRODUCTION'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    if (!this.isConfigured()) {
      throw new Error('Cashfree is not configured. Missing CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET.');
    }

    const { order, returnUrl, notifyUrl } = input;
    const sanitizedPhone = order.customer.phone.replace(/[\s+-]/g, '').slice(-10);

    const payload = {
      order_id: order.id,
      order_amount: order.total,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${sanitizedPhone || order.id}`,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: sanitizedPhone,
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
      order_note: `FeelsNeat Order ${order.id}`,
    };

    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': this.clientId!,
        'x-client-secret': this.clientSecret!,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Cashfree order creation failed: ${data.message || JSON.stringify(data)}`);
    }

    return {
      providerOrderId: data.order_id || order.id,
      paymentSessionId: data.payment_session_id,
      paymentUrl: data.payment_link || undefined,
      rawResponse: data,
    };
  }

  async verifyPayment(providerOrderId: string): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      throw new Error('Cashfree is not configured.');
    }

    const res = await fetch(`${this.baseUrl}/orders/${providerOrderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': this.clientId!,
        'x-client-secret': this.clientSecret!,
        'x-api-version': '2023-08-01',
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Cashfree payment verification error: ${data.message || JSON.stringify(data)}`);
    }

    // Cashfree returns an array of payment attempts
    const payments = Array.isArray(data) ? data : [];
    const successful = payments.find((p: any) => p.payment_status === 'SUCCESS');

    if (successful) {
      return {
        status: 'PAID',
        providerPaymentId: String(successful.cf_payment_id || successful.payment_id || ''),
        paymentMethod: successful.payment_group || successful.payment_method || 'ONLINE',
        amount: Number(successful.payment_amount || 0),
        paidAt: successful.payment_time || new Date().toISOString(),
        rawResponse: successful,
      };
    }

    const failed = payments.find((p: any) => p.payment_status === 'FAILED');
    if (failed && payments.length === 1) {
      return {
        status: 'FAILED',
        providerPaymentId: String(failed.cf_payment_id || ''),
        amount: Number(failed.payment_amount || 0),
        rawResponse: failed,
      };
    }

    return {
      status: 'PENDING',
      amount: 0,
      rawResponse: data,
    };
  }

  async verifyWebhookSignature(headers: Record<string, string>, rawBody: string): Promise<boolean> {
    const signature = headers['x-webhook-signature'] || headers['x-cf-signature'];
    const timestamp = headers['x-webhook-timestamp'] || headers['x-cf-timestamp'];

    if (!signature || !timestamp || !this.clientSecret) {
      return false;
    }

    try {
      const dataToSign = `${timestamp}${rawBody}`;
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.clientSecret);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const computed = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(dataToSign));
      const computedBase64 = btoa(String.fromCharCode(...new Uint8Array(computed)));
      return computedBase64 === signature;
    } catch (e) {
      console.error('Error verifying Cashfree webhook signature:', e);
      return false;
    }
  }

  parseWebhookEvent(rawBody: string): WebhookEventPayload | null {
    try {
      const event = JSON.parse(rawBody);
      const data = event.data || event;
      const order = data.order || {};
      const payment = data.payment || {};

      const orderId = order.order_id || data.order_id;
      const providerPaymentId = String(payment.cf_payment_id || payment.payment_id || data.cf_payment_id || '');
      const paymentStatusStr = (payment.payment_status || data.payment_status || event.type || '').toUpperCase();

      let paymentStatus: any = 'PENDING';
      if (paymentStatusStr.includes('SUCCESS') || paymentStatusStr === 'PAID') {
        paymentStatus = 'PAID';
      } else if (paymentStatusStr.includes('FAIL') || paymentStatusStr.includes('USER_DROPPED')) {
        paymentStatus = 'FAILED';
      }

      return {
        orderId: orderId,
        providerOrderId: orderId,
        providerPaymentId,
        paymentStatus,
        amount: Number(payment.payment_amount || order.order_amount || data.order_amount || 0),
        currency: order.order_currency || 'INR',
        paymentMethod: payment.payment_group || payment.payment_method || 'ONLINE',
        eventTime: event.event_time || new Date().toISOString(),
        rawEvent: event,
      };
    } catch (e) {
      console.error('Failed to parse Cashfree webhook event:', e);
      return null;
    }
  }

  async processRefund(paymentId: string, amount: number, reason: string): Promise<RefundResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Cashfree credentials not configured.',
      };
    }

    try {
      const payload = {
        refund_amount: amount,
        refund_id: `rfnd_${Date.now()}`,
        refund_note: reason,
      };

      const res = await fetch(`${this.baseUrl}/orders/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          'x-client-id': this.clientId!,
          'x-client-secret': this.clientSecret!,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          status: 'FAILED',
          error: data.message || 'Refund request failed',
          rawResponse: data,
        };
      }

      return {
        success: true,
        refundId: data.refund_id,
        status: data.refund_status === 'SUCCESS' ? 'PROCESSED' : 'PENDING',
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        error: err.message,
      };
    }
  }
}
