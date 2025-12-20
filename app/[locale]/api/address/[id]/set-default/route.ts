/**
 * Set Default Address API Proxy Route
 * PATCH /api/address/[id]/set-default - Set address as default
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/addresses/${id}/set-default`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Address API] Set Default Error:", error);
    return NextResponse.json(
      { message: "Failed to set default address", error: error.message },
      { status: 500 }
    );
  }
}
