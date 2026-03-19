import { getServiceById } from "@/lib/mock-data";
import { ProviderCallbackPayload, WebhookLogRecord } from "@/lib/types";

function computeNextRetry(attempt: number) {
  const delayMinutes = Math.min(2 ** attempt, 60);
  return new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
}

export async function dispatchWebhook(payload: ProviderCallbackPayload): Promise<WebhookLogRecord> {
  const service = payload.transactionId ? getServiceById(resolveServiceId(payload.transactionId)) : undefined;

  return {
    id: `wh_${Math.random().toString(36).slice(2, 8)}`,
    eventType: "transaction.updated",
    status: payload.status === "SUCCESS" ? "DELIVERED" : "RETRYING",
    attempt: 1,
    requestUrl: service?.webhookUrl ?? "https://example.com/webhooks/otopay",
    responseCode: payload.status === "SUCCESS" ? 200 : 503,
    nextRetryAt: payload.status === "FAILED" ? computeNextRetry(1) : undefined,
    createdAt: new Date().toISOString(),
    transactionId: payload.transactionId,
    serviceId: service?.id ?? "svc_core_shop"
  };
}

function resolveServiceId(transactionId: string) {
  if (transactionId.includes("pstk")) {
    return "svc_rides";
  }

  return "svc_core_shop";
}
