import {
  ApiKeyRecord,
  ServiceRecord,
  TransactionRecord,
  WebhookLogRecord
} from "@/lib/types";

export const services: ServiceRecord[] = [
  {
    id: "svc_core_shop",
    name: "Core Shop",
    slug: "core-shop",
    webhookUrl: "https://core-shop.example.com/webhooks/otopay",
    isActive: true,
    providerSettings: {
      mpesaShortcode: "174379",
      paystackChannel: "card"
    }
  },
  {
    id: "svc_rides",
    name: "Oto Rides",
    slug: "oto-rides",
    webhookUrl: "https://oto-rides.example.com/webhooks/payments",
    isActive: true,
    providerSettings: {
      mpesaShortcode: "603021",
      paystackChannel: "bank_transfer"
    }
  }
];

export const apiKeys: ApiKeyRecord[] = [
  {
    id: "key_1",
    label: "Production Server",
    keyPrefix: "otop_live_6e2c",
    lastUsedAt: "2026-03-19T10:30:00.000Z",
    scopes: ["payments:write", "transactions:read"],
    serviceId: "svc_core_shop"
  },
  {
    id: "key_2",
    label: "Staging Server",
    keyPrefix: "otop_test_89af",
    lastUsedAt: null,
    scopes: ["payments:write"],
    serviceId: "svc_rides"
  }
];

export const transactions: TransactionRecord[] = [
  {
    id: "txn_001",
    externalReference: "ORDER-1001",
    providerReference: "MPESA-8DJK20",
    provider: "MPESA",
    status: "SUCCESS",
    amount: 2500,
    currency: "KES",
    customerPhone: "+254700000001",
    createdAt: "2026-03-19T07:20:00.000Z",
    updatedAt: "2026-03-19T07:21:00.000Z",
    serviceId: "svc_core_shop",
    metadata: {
      source: "checkout"
    }
  },
  {
    id: "txn_002",
    externalReference: "SUB-2002",
    providerReference: "PSTK-220011",
    provider: "PAYSTACK",
    status: "PENDING",
    amount: 1500,
    currency: "KES",
    customerEmail: "billing@example.com",
    createdAt: "2026-03-19T08:00:00.000Z",
    updatedAt: "2026-03-19T08:00:00.000Z",
    serviceId: "svc_rides",
    metadata: {
      source: "subscription"
    }
  },
  {
    id: "txn_003",
    externalReference: "TOPUP-3003",
    providerReference: "MPESA-91QW31",
    provider: "MPESA",
    status: "FAILED",
    amount: 500,
    currency: "KES",
    customerPhone: "+254700000007",
    createdAt: "2026-03-19T09:15:00.000Z",
    updatedAt: "2026-03-19T09:18:00.000Z",
    serviceId: "svc_rides",
    metadata: {
      failureReason: "insufficient_funds"
    }
  }
];

export const webhookLogs: WebhookLogRecord[] = [
  {
    id: "wh_001",
    eventType: "transaction.updated",
    status: "DELIVERED",
    attempt: 1,
    requestUrl: "https://core-shop.example.com/webhooks/otopay",
    responseCode: 200,
    createdAt: "2026-03-19T07:21:05.000Z",
    transactionId: "txn_001",
    serviceId: "svc_core_shop"
  },
  {
    id: "wh_002",
    eventType: "transaction.updated",
    status: "RETRYING",
    attempt: 2,
    requestUrl: "https://oto-rides.example.com/webhooks/payments",
    responseCode: 503,
    nextRetryAt: "2026-03-19T08:10:00.000Z",
    createdAt: "2026-03-19T08:05:00.000Z",
    transactionId: "txn_002",
    serviceId: "svc_rides"
  }
];

export function getServiceBySlug(serviceSlug: string) {
  return services.find((service) => service.slug === serviceSlug);
}

export function getTransactionById(transactionId: string) {
  return transactions.find((transaction) => transaction.id === transactionId);
}

export function getServiceById(serviceId: string) {
  return services.find((service) => service.id === serviceId);
}
