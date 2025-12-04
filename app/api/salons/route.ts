/**
 * Salons API Proxy Routes
 * GET /api/salons - Get all salons
 * GET /api/salons/my-salons - Get user's salons (protected)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const verified = searchParams.get("verified");

    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (verified) queryParams.append("verified", verified);

    const url = `${BACKEND_URL}/salons${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Salons API] GET Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch salons", error: error.message },
      { status: 500 }
    );
  }
}
