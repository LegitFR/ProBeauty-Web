/**
 * Cart Items API Proxy
 * Handles adding items to cart
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

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
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { message: "productId and quantity are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ productId, quantity }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Cart Items API] POST Error:", error);
    return NextResponse.json(
      { message: "Failed to add item to cart", error: error.message },
      { status: 500 }
    );
  }
}
