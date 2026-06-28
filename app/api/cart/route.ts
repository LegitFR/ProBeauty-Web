/**
 * Cart API Proxy Routes
 * Proxies cart requests to backend API to keep URL secure
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://vps-9ebf5d76.vps.ovh.net:5000/api/v1";

// GET /api/cart - Get cart
// POST /api/cart/items - Add item
// PATCH /api/cart/items/:productId - Update item
// DELETE /api/cart/items/:productId - Remove item
// DELETE /api/cart - Clear cart

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });


    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[Cart Proxy] Failed to parse response as JSON:", e);
      return NextResponse.json(
        { message: "Invalid response from backend", rawResponse: responseText },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Cart Proxy] GET Error:", error);
    console.error("[Cart Proxy] Error stack:", error.stack);
    return NextResponse.json(
      { message: "Failed to get cart", error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 },
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
      { status: 500 },
    );
  }
}
