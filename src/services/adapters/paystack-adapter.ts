import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { InitiatePaymentInput, InitiatePaymentResult, ServiceRecord } from "@/lib/types";

export async function initializePaystackTransaction(
  input: InitiatePaymentInput,
  service: ServiceRecord
): Promise<InitiatePaymentResult & { providerPayload: Record<string, string> }> {
  const providerReference = buildProviderReference("PSTK", input.reference ?? input.customerEmail ?? "");
  const channel = service.providerSettings.paystackChannel ?? "card";

  return {
    transactionId: "",
    status: "PENDING",
    provider: "PAYSTACK",
    providerReference,
    checkoutUrl: `https://checkout.paystack.com/${providerReference.toLowerCase()}`,
    providerPayload: {
      channel,
      customerEmail: input.customerEmail ?? "",
      callbackUrl: `${service.webhookUrl}?provider=paystack`
    },
    message: `Mock Paystack checkout initialized for ${input.customerEmail ?? "unknown email"}`
  };
}

export async function verifyPaystackSignature(signature: string | null, rawBody: string) {
  if (!env.PAYSTACK_WEBHOOK_SECRET) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = createHmac("sha512", env.PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const actual = Buffer.from(signature, "hex");
  const target = Buffer.from(expected, "hex");

  return actual.length === target.length && timingSafeEqual(actual, target);
}

function buildProviderReference(prefix: string, seed: string) {
  const digest = createHash("sha1")
    .update(`${prefix}:${seed}:${Date.now()}:${Math.random().toString(16).slice(2)}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();

  return `${prefix}-${digest}`;
}
