import { NextRequest, NextResponse } from "next/server";
import { getCheckoutBackendApiUrl } from "@/lib/config/backend";

/**
 * POST /api/bookings/checkout
 * Creates a booking with Stripe payment intent
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl = getCheckoutBackendApiUrl(body.paymentMethod);

    let response: Response;
    try {
      response = await fetch(`${backendUrl}/bookings/checkout`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error: unknown) {
      const fetchError = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        {
          message:
            body.paymentMethod === "MBWAY"
              ? "Could not reach the MB WAY test backend URL. Verify TEST_NGROK_BASE_URL and ensure ngrok is running."
              : "Could not reach backend service.",
          error: fetchError,
          backendUrl,
        },
        { status: 502 },
      );
    }

    const rawResponseBody = await response.text();
    let data: { message?: string; error?: string; [key: string]: unknown };
    try {
      data = rawResponseBody ? JSON.parse(rawResponseBody) : {};
    } catch {
      return NextResponse.json(
        {
          message: "Backend returned a non-JSON response",
          status: response.status,
          backendUrl,
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || "Failed to create booking checkout session",
          error: data.error,
          details: data,
          backendUrl,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create booking checkout session";
    console.error("Error creating booking checkout session:", error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
