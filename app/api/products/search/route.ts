/**
 * Products Search API Proxy Route
 * Proxies product search requests to backend API with fuzzy matching
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { message: "Search query is required", data: [] },
        { status: 400 }
      );
    }

    // Build query string from all possible parameters
    const params = new URLSearchParams();
    params.append("q", query);

    // Pagination
    const page = searchParams.get("page");
    const limit = searchParams.get("limit") || "50";
    if (page) params.append("page", page);
    params.append("limit", limit);

    // Filters
    const salonId = searchParams.get("salonId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");

    if (salonId) params.append("salonId", salonId);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (inStock) params.append("inStock", inStock);

    const response = await fetch(
      `${BACKEND_URL}/products/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`[Products Search API] Backend error: ${response.status}`);
      return NextResponse.json(
        { message: "Failed to search products", data: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Products Search API] Error:", error);
    return NextResponse.json(
      {
        message: "Failed to search products",
        data: [],
        error: error.message,
      },
      { status: 500 }
    );
  }
}
