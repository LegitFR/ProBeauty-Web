/**
 * Products API Proxy Route
 * Proxies product requests to backend API to keep URL secure
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "50";
    const inStock = searchParams.get("inStock") || "true";

    const response = await fetch(
      `${BACKEND_URL}/products?limit=${limit}&inStock=${inStock}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`[Products API] Backend error: ${response.status}`);
      return NextResponse.json(
        { message: "Failed to fetch products", data: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Products API] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", data: [], error: error.message },
      { status: 500 }
    );
  }
}
