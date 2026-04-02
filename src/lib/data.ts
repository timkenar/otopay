import { createHash, timingSafeEqual } from "node:crypto";
import {
  APIKey,
  PaymentProvider,
  Prisma,
  Service,
  Transaction,
  TransactionStatus,
  WebhookDeliveryStatus,
  WebhookLog
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ApiKeyRecord,
  PaymentProvider as PaymentProviderRecord,
  ServiceRecord,
  TransactionRecord,
  TransactionStatus as TransactionStatusRecord,
  WebhookDeliveryStatus as WebhookDeliveryStatusRecord,
  WebhookLogRecord
} from "@/lib/types";

type TransactionWithService = Transaction & { service: Service };
type WebhookLogWithService = WebhookLog & { service: Service };

function toJsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function asStringRecord(value: Prisma.JsonValue | null | undefined): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, String(entry)])
  );
}

function mapService(service: Service): ServiceRecord {
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    webhookUrl: service.webhookUrl,
    isActive: service.isActive,
    providerSettings: asStringRecord(service.providerSettings)
  };
}

function mapApiKey(apiKey: APIKey): ApiKeyRecord {
  return {
    id: apiKey.id,
    label: apiKey.label,
    keyPrefix: apiKey.keyPrefix,
    lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
    scopes: Array.isArray(apiKey.scopes) ? apiKey.scopes.map(String) : [],
    serviceId: apiKey.serviceId
  };
}

function mapTransaction(transaction: Transaction): TransactionRecord {
  return {
    id: transaction.id,
    externalReference: transaction.externalReference ?? "",
    providerReference: transaction.providerReference ?? "",
    provider: transaction.provider as PaymentProviderRecord,
    status: transaction.status as TransactionStatusRecord,
    amount: transaction.amount,
    currency: transaction.currency,
    customerPhone: transaction.customerPhone ?? undefined,
    customerEmail: transaction.customerEmail ?? undefined,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    serviceId: transaction.serviceId,
    metadata: asStringRecord(transaction.metadata)
  };
}

function mapWebhookLog(log: WebhookLog): WebhookLogRecord {
  return {
    id: log.id,
    eventType: log.eventType,
    status: log.status as WebhookDeliveryStatusRecord,
    attempt: log.attempt,
    requestUrl: log.requestUrl,
    responseCode: log.responseCode ?? undefined,
    nextRetryAt: log.nextRetryAt?.toISOString(),
    createdAt: log.createdAt.toISOString(),
    transactionId: log.transactionId ?? undefined,
    serviceId: log.serviceId
  };
}

export async function listServices(): Promise<ServiceRecord[]> {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "asc" }
  });

  return services.map(mapService);
}

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  const apiKeys = await prisma.aPIKey.findMany({
    orderBy: { createdAt: "asc" }
  });

  return apiKeys.map(mapApiKey);
}

export async function listTransactions(): Promise<TransactionRecord[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" }
  });

  return transactions.map(mapTransaction);
}

export async function listWebhookLogs(): Promise<WebhookLogRecord[]> {
  const webhookLogs = await prisma.webhookLog.findMany({
    orderBy: { createdAt: "desc" }
  });

  return webhookLogs.map(mapWebhookLog);
}

export async function getServiceById(serviceId: string): Promise<ServiceRecord | null> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  return service ? mapService(service) : null;
}

export async function getServiceBySlug(serviceSlug: string): Promise<ServiceRecord | null> {
  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug }
  });

  return service ? mapService(service) : null;
}

export async function getTransactionById(transactionId: string): Promise<TransactionRecord | null> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  return transaction ? mapTransaction(transaction) : null;
}

export async function getTransactionByLookup(
  transactionId?: string,
  providerReference?: string
): Promise<TransactionWithService | null> {
  if (transactionId) {
    return prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { service: true }
    });
  }

  if (providerReference) {
    return prisma.transaction.findFirst({
      where: { providerReference },
      include: { service: true }
    });
  }

  return null;
}

export async function createTransaction(input: {
  externalReference?: string;
  providerReference: string;
  provider: PaymentProvider;
  status: TransactionStatus;
  amount: number;
  currency: string;
  customerPhone?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  providerPayload?: unknown;
  serviceId: string;
}) {
  const transaction = await prisma.transaction.create({
    data: {
      externalReference: input.externalReference,
      providerReference: input.providerReference,
      provider: input.provider,
      status: input.status,
      amount: input.amount,
      currency: input.currency,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      metadata: toJsonInput(input.metadata ?? {}),
      providerPayload: input.providerPayload ? toJsonInput(input.providerPayload) : undefined,
      serviceId: input.serviceId
    }
  });

  return mapTransaction(transaction);
}

export async function updateTransactionFromCallback(input: {
  transactionId?: string;
  providerReference?: string;
  provider: PaymentProvider;
  status: TransactionStatus;
  rawPayload: unknown;
}): Promise<TransactionWithService> {
  const existing = await getTransactionByLookup(input.transactionId, input.providerReference);

  if (!existing) {
    throw new Error("Transaction was not found for callback");
  }

  if (existing.provider !== input.provider) {
    throw new Error("Callback provider does not match transaction provider");
  }

  const transaction = await prisma.transaction.update({
    where: { id: existing.id },
    data: {
      status: input.status,
      callbackPayload: toJsonInput(input.rawPayload)
    },
    include: { service: true }
  });

  return transaction;
}

export async function createWebhookLog(input: {
  eventType: string;
  status: WebhookDeliveryStatus;
  attempt: number;
  requestUrl: string;
  requestBody: unknown;
  responseCode?: number;
  responseBody?: string;
  nextRetryAt?: Date;
  transactionId?: string;
  serviceId: string;
}) {
  const log = await prisma.webhookLog.create({
    data: {
      ...input,
      requestBody: toJsonInput(input.requestBody)
    }
  });

  return mapWebhookLog(log);
}

export async function listTransactionsWithServices() {
  return prisma.transaction.findMany({
    include: { service: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function listWebhookLogsWithServices(): Promise<WebhookLogWithService[]> {
  return prisma.webhookLog.findMany({
    include: { service: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function listApiKeysWithServices() {
  return prisma.aPIKey.findMany({
    include: { service: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getDashboardSummary() {
  const [servicesCount, activeServicesCount, transactionSummary, successfulTransactions, webhookAlerts] =
    await Promise.all([
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
      prisma.transaction.count({ where: { status: "SUCCESS" } }),
      prisma.webhookLog.count({ where: { status: { not: "DELIVERED" } } })
    ]);

  return {
    servicesCount,
    activeServicesCount,
    transactionCount: transactionSummary._count._all,
    totalVolume: transactionSummary._sum.amount ?? 0,
    successfulTransactions,
    webhookAlerts
  };
}

export async function authenticateApiKey(rawApiKey: string) {
  const [keyPrefix] = rawApiKey.split(".");

  if (!keyPrefix) {
    return null;
  }

  const apiKey = await prisma.aPIKey.findFirst({
    where: { keyPrefix },
    include: { service: true }
  });

  if (!apiKey || apiKey.revokedAt) {
    return null;
  }

  const incomingHash = createHash("sha256").update(rawApiKey).digest("hex");
  const storedHash = Buffer.from(apiKey.keyHash, "hex");
  const candidateHash = Buffer.from(incomingHash, "hex");

  if (storedHash.length !== candidateHash.length || !timingSafeEqual(storedHash, candidateHash)) {
    return null;
  }

  await prisma.aPIKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  });

  return apiKey;
}
