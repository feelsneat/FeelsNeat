import { EcommerceOrder, PaymentStatus } from '../types';

export interface CreatePaymentOrderInput {
  order: EcommerceOrder;
  returnUrl: string;
  notifyUrl?: string;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  paymentSessionId?: string;
  paymentUrl?: string;
  rawResponse?: any;
}

export interface PaymentVerificationResult {
  status: PaymentStatus;
  providerPaymentId?: string;
  paymentMethod?: string;
  amount: number;
  paidAt?: string;
  rawResponse?: any;
}

export interface WebhookEventPayload {
  orderId: string;
  providerOrderId: string;
  providerPaymentId?: string;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod?: string;
  eventTime: string;
  rawEvent: any;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  error?: string;
  rawResponse?: any;
}

export interface PaymentProvider {
  name: string;
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyPayment(providerOrderId: string): Promise<PaymentVerificationResult>;
  verifyWebhookSignature(headers: Record<string, string>, rawBody: string): Promise<boolean>;
  parseWebhookEvent(rawBody: string): WebhookEventPayload | null;
  processRefund(paymentId: string, amount: number, reason: string): Promise<RefundResult>;
}
