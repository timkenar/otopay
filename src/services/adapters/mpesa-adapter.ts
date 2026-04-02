import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import { InitiatePaymentInput, InitiatePaymentResult, ServiceRecord } from "@/lib/types";

export async function initiateMpesaStkPush(
  input: InitiatePaymentInput,
  service: ServiceRecord
): Promise<InitiatePaymentResult & { providerPayload: Record<string, string> }> {
  const providerReference = buildProviderReference("MPESA", input.reference ?? input.customerPhone ?? "");
  const shortcode = service.providerSettings.mpesaShortcode ?? env.MPESA_SHORTCODE ?? "sandbox";

  return {
    transactionId: "",
    status: "PENDING",
    provider: "MPESA",
    providerReference,
    providerPayload: {
      shortcode,
      accountReference: input.reference ?? providerReference,
      customerPhone: input.customerPhone ?? ""
    },
    message: `Mock STK push created for ${input.customerPhone ?? "unknown phone"}`
  };
}

export async function validateMpesaCallback(
  payload: unknown,
  callbackToken: string | null
) {
  if (!callbackToken) {
    return true;
  }

  return (
    typeof payload === "object" &&
    payload !== null &&
    "callbackToken" in payload &&
    payload.callbackToken === callbackToken
  );
}

function buildProviderReference(prefix: string, seed: string) {
  const digest = createHash("sha1")
    .update(`${prefix}:${seed}:${Date.now()}:${Math.random().toString(16).slice(2)}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();

  return `${prefix}-${digest}`;
}
