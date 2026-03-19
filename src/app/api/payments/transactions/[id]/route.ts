import { NextResponse } from "next/server";
import { getTransaction } from "@/services/payment-orchestrator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = await getTransaction(id);

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to fetch transaction"
      },
      { status: 404 }
    );
  }
}
