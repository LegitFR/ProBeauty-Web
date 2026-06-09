/**
 * Products API Proxy Route
 * Proxies product requests to backend API to keep URL secure
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://vps-9ebf5d76.vps.ovh.net:5000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build query string from all possible parameters
    const params = new URLSearchParams();

    // Pagination
    const page = searchParams.get("page");
    const limit = searchParams.get("limit") || "50";
    if (page) params.append("page", page);
    params.append("limit", limit);

    // Filters
    const salonId = searchParams.get("salonId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock") || "true";

    if (salonId) params.append("salonId", salonId);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    params.append("inStock", inStock);

    const response = await fetch(
      `${BACKEND_URL}/products?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(`[Products API] Backend error: ${response.status}`);
      return NextResponse.json(
        { message: "Failed to fetch products", data: [] },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Products API] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", data: [], error: error.message },
      { status: 500 },
    );
  }
}
