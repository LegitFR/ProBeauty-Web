/**
 * Review API Route Handler
 * Proxies requests to the backend review service
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://probeauty-backend.onrender.com/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get token from Authorization header or cookies
    let token = request.cookies.get("accessToken")?.value;
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to create review" },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const productId = searchParams.get("productId");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "100";

    if (!salonId && !productId) {
      return NextResponse.json(
        { message: "Either salonId or productId is required" },
        { status: 400 },
      );
    }

    // Build query params
    const params = new URLSearchParams({
      page,
      limit,
    });

    if (salonId) {
      params.append("salonId", salonId);
    }
    if (productId) {
      params.append("productId", productId);
    }

    const response = await fetch(
      `${API_BASE_URL}/reviews?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || "Failed to fetch reviews",
          data: [],
          averageRating: 0,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0,
          },
        },
        { status: response.status },
      );
    }

    // Calculate average rating from the reviews
    let averageRating = 0;
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const sum = data.data.reduce(
        (acc: number, review: any) => acc + (review.rating || 0),
        0,
      );
      averageRating = Math.round((sum / data.data.length) * 10) / 10;
    }

    return NextResponse.json({
      ...data,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        data: [],
        averageRating: 0,
        pagination: {
          page: 1,
          limit: 100,
          total: 0,
          totalPages: 0,
        },
      },
      { status: 500 },
    );
  }
}
