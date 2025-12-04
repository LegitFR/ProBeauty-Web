/**
 * Cart API Proxy Routes
 * Proxies cart requests to backend API to keep URL secure
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

// GET /api/cart - Get cart
// POST /api/cart/items - Add item
// PATCH /api/cart/items/:productId - Update item
// DELETE /api/cart/items/:productId - Remove item
// DELETE /api/cart - Clear cart

export async function GET(request: NextRequest) {
  console.log("[Cart Proxy] GET request received");
  try {
    const token = request.headers.get("authorization");
    console.log(
      "[Cart Proxy] Token:",
      token ? `${token.substring(0, 30)}...` : "none"
    );

    if (!token) {
      console.log("[Cart Proxy] No token provided");
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("[Cart Proxy] Calling backend:", `${BACKEND_URL}/cart`);
    const response = await fetch(`${BACKEND_URL}/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    console.log("[Cart Proxy] Backend response status:", response.status);

    const responseText = await response.text();
    console.log("[Cart Proxy] Backend raw response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("[Cart Proxy] Backend parsed data:", data);
    } catch (e) {
      console.error("[Cart Proxy] Failed to parse response as JSON:", e);
      return NextResponse.json(
        { message: "Invalid response from backend", rawResponse: responseText },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Cart Proxy] GET Error:", error);
    console.error("[Cart Proxy] Error stack:", error.stack);
    return NextResponse.json(
      { message: "Failed to get cart", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/cart`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Cart API] DELETE Error:", error);
    return NextResponse.json(
      { message: "Failed to clear cart", error: error.message },
      { status: 500 }
    );
  }
}
