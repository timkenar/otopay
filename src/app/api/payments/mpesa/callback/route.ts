import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { handleProviderCallback } from "@/services/payment-orchestrator";
import { validateMpesaCallback } from "@/services/adapters/mpesa-adapter";

const mpesaCallbackSchema = z.object({
  transactionId: z.string().optional(),
  providerReference: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILED"])
});

export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.json();
    const isValid = await validateMpesaCallback(rawPayload, env.MPESA_CALLBACK_TOKEN ?? null);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid Mpesa callback" }, { status: 401 });
    }

    const payload = mpesaCallbackSchema.parse(rawPayload);
    const result = await handleProviderCallback({
      provider: "MPESA",
      ...payload,
      rawPayload
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process Mpesa callback"
      },
      { status: 400 }
    );
  }
}
