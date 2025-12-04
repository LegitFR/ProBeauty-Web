/**
 * Address API Proxy Routes for specific address operations
 * PATCH /api/address/[id] - Update address
 * DELETE /api/address/[id] - Delete address
 * PATCH /api/address/[id]/set-default - Set as default address
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

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/addresses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Address API] PATCH Error:", error);
    return NextResponse.json(
      { message: "Failed to update address", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("[Address Proxy] DELETE request for ID:", id);

  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/addresses/${id}`;
    console.log("[Address Proxy] Calling backend:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    console.log("[Address Proxy] Backend response status:", response.status);

    const data = await response.json();
    console.log("[Address Proxy] Backend response data:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Address Proxy] DELETE Error:", error);
    return NextResponse.json(
      { message: "Failed to delete address", error: error.message },
      { status: 500 }
    );
  }
}
