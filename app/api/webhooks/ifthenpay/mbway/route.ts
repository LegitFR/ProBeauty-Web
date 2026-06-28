import { NextRequest, NextResponse } from "next/server";
import { getWebhookBackendApiUrl } from "@/lib/config/backend";

/**
 * GET /api/webhooks/ifthenpay/mbway
 * Proxy for If-Then Pay MB WAY webhook callback
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = getWebhookBackendApiUrl();

    // Get all query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();


    // Forward to backend webhook endpoint
    const response = await fetch(
      `${backendUrl}/webhooks/ifthenpay/mbway?${queryString}`,
      {
        method: "GET",
      },
    );

    const data = await response.json();


    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Webhook processing failed" },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error processing MB WAY webhook:", error);
    return NextResponse.json(
      { message: error.message || "Webhook processing failed" },
      { status: 500 },
    );
  }
}
