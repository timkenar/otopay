import { createHmac } from "node:crypto";
import { TransactionStatus, WebhookDeliveryStatus } from "@prisma/client";
import { createWebhookLog } from "@/lib/data";
import { env } from "@/lib/env";
import { WebhookLogRecord } from "@/lib/types";

function computeNextRetry(attempt: number) {
  const delayMinutes = Math.min(2 ** attempt, 60);
  return new Date(Date.now() + delayMinutes * 60 * 1000);
}

export async function dispatchWebhook(input: {
  transaction: {
    id: string;
    providerReference: string | null;
    status: TransactionStatus;
    metadata: unknown;
    providerPayload: unknown;
    callbackPayload: unknown;
    serviceId: string;
    service: {
      webhookUrl: string;
    };
  };
}): Promise<WebhookLogRecord> {
  const requestBody = {
    transactionId: input.transaction.id,
    status: input.transaction.status,
    providerData: {
      providerReference: input.transaction.providerReference,
      initiated: input.transaction.providerPayload,
      callback: input.transaction.callbackPayload
    },
    metadata: input.transaction.metadata
  };
  const body = JSON.stringify(requestBody);
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (env.OTOPAY_WEBHOOK_SIGNING_SECRET) {
    headers["x-otopay-signature"] = createHmac("sha256", env.OTOPAY_WEBHOOK_SIGNING_SECRET)
      .update(body)
      .digest("hex");
  }

  try {
    const response = await fetch(input.transaction.service.webhookUrl, {
      method: "POST",
      headers,
      body
    });
    const responseBody = await response.text();

    return createWebhookLog({
      eventType: "transaction.updated",
      status: response.ok ? WebhookDeliveryStatus.DELIVERED : WebhookDeliveryStatus.RETRYING,
      attempt: 1,
      requestUrl: input.transaction.service.webhookUrl,
      requestBody,
      responseCode: response.status,
      responseBody,
      nextRetryAt: response.ok ? undefined : computeNextRetry(1),
      transactionId: input.transaction.id,
      serviceId: input.transaction.serviceId
    });
  } catch (error) {
    return createWebhookLog({
      eventType: "transaction.updated",
      status: WebhookDeliveryStatus.RETRYING,
      attempt: 1,
      requestUrl: input.transaction.service.webhookUrl,
      requestBody,
      responseCode: 503,
      responseBody: error instanceof Error ? error.message : "Webhook dispatch failed",
      nextRetryAt: computeNextRetry(1),
      transactionId: input.transaction.id,
      serviceId: input.transaction.serviceId
    });
  }
}
