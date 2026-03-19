import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
    const payload = stkSchema.parse(await request.json());
    const result = await initiateStkPayment(payload);

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid STK request"
      },
      { status: 400 }
    );
  }
}
