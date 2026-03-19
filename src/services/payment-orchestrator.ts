import { getServiceBySlug, getTransactionById } from "@/lib/mock-data";
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
  const service = getRequiredService(input.serviceSlug);
  const result = await initiateMpesaStkPush(input);

  return {
    ...result,
    serviceName: service.name
  };
}

export async function initiatePaystackPayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult & { serviceName: string }> {
  const service = getRequiredService(input.serviceSlug);
  const result = await initializePaystackTransaction(input);

  return {
    ...result,
    serviceName: service.name
  };
}

export async function handleProviderCallback(payload: ProviderCallbackPayload) {
  const webhookLog = await dispatchWebhook(payload);

  return {
    acknowledged: true,
    webhookLog
  };
}

export async function getTransaction(transactionId: string): Promise<TransactionRecord> {
  const transaction = getTransactionById(transactionId);

  if (!transaction) {
    throw new Error(`Transaction ${transactionId} was not found`);
  }

  return transaction;
}

function getRequiredService(serviceSlug: string) {
  const service = getServiceBySlug(serviceSlug);

  if (!service) {
    throw new Error(`Unknown service slug: ${serviceSlug}`);
  }

  return service;
}
