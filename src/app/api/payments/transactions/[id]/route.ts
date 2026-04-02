import { NextRequest, NextResponse } from "next/server";
import { requireServiceApiKey } from "@/lib/api-auth";
import { getTransaction } from "@/services/payment-orchestrator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = await requireServiceApiKey(request, ["transactions:read"]);
    const { id } = await params;
    const transaction = await getTransaction(id);

    if (apiKey.serviceId !== transaction.serviceId) {
      return NextResponse.json({ error: "API key cannot access this transaction" }, { status: 403 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch transaction";
    const status = message.includes("API key") ? 401 : 404;

    return NextResponse.json(
      {
        error: message
      },
      { status }
    );
  }
}
