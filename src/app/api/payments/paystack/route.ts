import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServiceApiKey } from "@/lib/api-auth";
import { initiatePaystackPayment } from "@/services/payment-orchestrator";

const paystackSchema = z.object({
  serviceSlug: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(3).default("KES"),
  customerEmail: z.string().email(),
  reference: z.string().optional(),
  metadata: z.record(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = await requireServiceApiKey(request, ["payments:write"]);
    const payload = paystackSchema.parse(await request.json());

    if (apiKey.service.slug !== payload.serviceSlug) {
      return NextResponse.json({ error: "API key does not match service" }, { status: 403 });
    }

    const result = await initiatePaystackPayment(payload);

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Paystack request";
    const status = message.includes("API key") || message.includes("Service is inactive") ? 401 : 400;

    return NextResponse.json(
      {
        error: message
      },
      { status }
    );
  }
}
