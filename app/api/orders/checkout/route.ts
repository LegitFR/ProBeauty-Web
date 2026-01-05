import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://probeauty-backend.onrender.com/api/v1";

/**
 * POST /api/orders/checkout
 * Creates an order with Stripe payment intent
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

    const response = await fetch(`${BACKEND_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to create checkout session" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
