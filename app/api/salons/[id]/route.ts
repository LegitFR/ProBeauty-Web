/**
 * Single Salon API Proxy Route
 * GET /api/salons/[id] - Get salon by ID
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/salons/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Ensure staff property is always an array
    if (data.data && data.data.staff && !Array.isArray(data.data.staff)) {
      console.warn("Staff property is not an array, converting to array");
      data.data.staff = [];
    } else if (data.data && !data.data.staff) {
      data.data.staff = [];
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Salon API] GET by ID Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch salon", error: error.message },
      { status: 500 }
    );
  }
}
