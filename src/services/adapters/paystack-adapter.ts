import { InitiatePaymentInput, InitiatePaymentResult } from "@/lib/types";

export async function initializePaystackTransaction(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  const providerReference = `PSTK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  return {
    transactionId: `txn_${providerReference.toLowerCase()}`,
    status: "PENDING",
    provider: "PAYSTACK",
    providerReference,
    checkoutUrl: `https://checkout.paystack.com/${providerReference.toLowerCase()}`,
    message: `Mock Paystack checkout initialized for ${input.customerEmail ?? "unknown email"}`
  };
}

export async function verifyPaystackSignature(_signature: string | null) {
  return true;
}
