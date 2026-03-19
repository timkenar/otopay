import { InitiatePaymentInput, InitiatePaymentResult } from "@/lib/types";

export async function initiateMpesaStkPush(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  const providerReference = `MPESA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  return {
    transactionId: `txn_${providerReference.toLowerCase()}`,
    status: "PENDING",
    provider: "MPESA",
    providerReference,
    message: `Mock STK push created for ${input.customerPhone ?? "unknown phone"}`
  };
}

export async function validateMpesaCallback(_payload: unknown) {
  return true;
}
