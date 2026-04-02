import { PaymentProvider } from "@prisma/client";
import {
  createTransaction,
  getServiceBySlug,
  getTransactionById,
  updateTransactionFromCallback
} from "@/lib/data";
import {
  InitiatePaymentInput,
  InitiatePaymentResult,
  ProviderCallbackPayload,
  TransactionRecord
} from "@/lib/types";
import { initiateMpesaStkPush } from "@/services/adapters/mpesa-adapter";
import { initializePaystackTransaction } from "@/services/adapters/paystack-adapter";
import { dispatchWebhook } from "@/services/webhook-dispatcher";

export async function initiateStkPayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult & { serviceName: string }> {
  const service = await getRequiredService(input.serviceSlug);
  const result = await initiateMpesaStkPush(input, service);
  const transaction = await createTransaction({
    externalReference: input.reference,
    providerReference: result.providerReference,
    provider: PaymentProvider.MPESA,
    status: "PENDING",
    amount: input.amount,
    currency: input.currency,
    customerPhone: input.customerPhone,
    metadata: input.metadata,
    providerPayload: result.providerPayload,
    serviceId: service.id
  });

  return {
    ...transactionResult(result, transaction.id),
    serviceName: service.name
  };
}

export async function initiatePaystackPayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult & { serviceName: string }> {
  const service = await getRequiredService(input.serviceSlug);
  const result = await initializePaystackTransaction(input, service);
  const transaction = await createTransaction({
    externalReference: input.reference,
    providerReference: result.providerReference,
    provider: PaymentProvider.PAYSTACK,
    status: "PENDING",
    amount: input.amount,
    currency: input.currency,
    customerEmail: input.customerEmail,
    metadata: input.metadata,
    providerPayload: result.providerPayload,
    serviceId: service.id
  });

  return {
    ...transactionResult(result, transaction.id),
    serviceName: service.name
  };
}

export async function handleProviderCallback(payload: ProviderCallbackPayload) {
  const transaction = await updateTransactionFromCallback({
    transactionId: payload.transactionId,
    providerReference: payload.providerReference,
    provider: payload.provider,
    status: payload.status,
    rawPayload: payload.rawPayload
  });
  const webhookLog = await dispatchWebhook({ transaction });

  return {
    acknowledged: true,
    transactionId: transaction.id,
    status: transaction.status,
    webhookLog
  };
}

export async function getTransaction(transactionId: string): Promise<TransactionRecord> {
  const transaction = await getTransactionById(transactionId);

  if (!transaction) {
    throw new Error(`Transaction ${transactionId} was not found`);
  }

  return transaction;
}

function transactionResult(
  result: InitiatePaymentResult & { providerPayload?: Record<string, string> },
  transactionId: string
): InitiatePaymentResult {
  return {
    transactionId,
    status: result.status,
    provider: result.provider,
    providerReference: result.providerReference,
    checkoutUrl: result.checkoutUrl,
    message: result.message
  };
}

async function getRequiredService(serviceSlug: string) {
  const service = await getServiceBySlug(serviceSlug);

  if (!service) {
    throw new Error(`Unknown service slug: ${serviceSlug}`);
  }

  if (!service.isActive) {
    throw new Error(`Service ${serviceSlug} is inactive`);
  }

  return service;
}
