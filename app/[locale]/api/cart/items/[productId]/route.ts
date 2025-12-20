/**
 * Cart Item Update/Delete API Proxy
 * Handles updating and removing specific items
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quantity } = body;
    const receivedParams = await params;
    const productId = receivedParams.productId;

    if (!quantity) {
      return NextResponse.json(
        { message: "quantity is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/cart/items/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ quantity }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Cart Item API] PATCH Error:", error);
    return NextResponse.json(
      { message: "Failed to update cart item", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }
    const receivedParams = await params;
    const response = await fetch(
      `${BACKEND_URL}/cart/items/${receivedParams.productId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Cart Item API] DELETE Error:", error);
    return NextResponse.json(
      { message: "Failed to remove cart item", error: error.message },
      { status: 500 }
    );
  }
}
