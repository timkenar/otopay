import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaystackSignature } from "@/services/adapters/paystack-adapter";
import { handleProviderCallback } from "@/services/payment-orchestrator";

const paystackWebhookSchema = z.object({
  transactionId: z.string().optional(),
  providerReference: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILED"])
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const verified = await verifyPaystackSignature(signature, rawBody);

    if (!verified) {
      return NextResponse.json({ error: "Invalid Paystack signature" }, { status: 401 });
    }

    const rawPayload = JSON.parse(rawBody);
    const payload = paystackWebhookSchema.parse(rawPayload);
    const result = await handleProviderCallback({
      provider: "PAYSTACK",
      ...payload,
      rawPayload
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process Paystack webhook"
      },
      { status: 400 }
    );
  }
}
