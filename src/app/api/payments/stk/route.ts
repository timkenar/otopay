import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServiceApiKey } from "@/lib/api-auth";
import { initiateStkPayment } from "@/services/payment-orchestrator";

const stkSchema = z.object({
  serviceSlug: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(3).default("KES"),
  customerPhone: z.string().min(7),
  reference: z.string().optional(),
  metadata: z.record(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = await requireServiceApiKey(request, ["payments:write"]);
    const payload = stkSchema.parse(await request.json());

    if (apiKey.service.slug !== payload.serviceSlug) {
      return NextResponse.json({ error: "API key does not match service" }, { status: 403 });
    }

    const result = await initiateStkPayment(payload);

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid STK request";
    const status = message.includes("API key") || message.includes("Service is inactive") ? 401 : 400;

    return NextResponse.json(
      {
        error: message
      },
      { status }
    );
  }
}
