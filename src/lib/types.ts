export type PaymentProvider = "MPESA" | "PAYSTACK";
export type TransactionStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
export type WebhookDeliveryStatus = "PENDING" | "DELIVERED" | "FAILED" | "RETRYING";

export type ServiceRecord = {
  id: string;
  name: string;
  slug: string;
  webhookUrl: string;
  isActive: boolean;
  providerSettings: Record<string, string>;
};

export type ApiKeyRecord = {
  id: string;
  label: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  scopes: string[];
  serviceId: string;
};

export type TransactionRecord = {
  id: string;
  externalReference: string;
  providerReference: string;
  provider: PaymentProvider;
  status: TransactionStatus;
  amount: number;
  currency: string;
  customerPhone?: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
  serviceId: string;
  metadata: Record<string, string>;
};

export type WebhookLogRecord = {
  id: string;
  eventType: string;
  status: WebhookDeliveryStatus;
  attempt: number;
  requestUrl: string;
  responseCode?: number;
  nextRetryAt?: string;
  createdAt: string;
  transactionId?: string;
  serviceId: string;
};

export type InitiatePaymentInput = {
  serviceSlug: string;
  amount: number;
  currency: string;
  customerPhone?: string;
  customerEmail?: string;
  reference?: string;
  metadata?: Record<string, string>;
};

export type InitiatePaymentResult = {
  transactionId: string;
  status: TransactionStatus;
  provider: PaymentProvider;
  providerReference: string;
  checkoutUrl?: string;
  message: string;
};

export type ProviderCallbackPayload = {
  provider: PaymentProvider;
  transactionId?: string;
  providerReference?: string;
  status: Extract<TransactionStatus, "SUCCESS" | "FAILED">;
  rawPayload: unknown;
};
