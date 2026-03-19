import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
    const payload = paystackSchema.parse(await request.json());
    const result = await initiatePaystackPayment(payload);

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid Paystack request"
      },
      { status: 400 }
    );
  }
}
