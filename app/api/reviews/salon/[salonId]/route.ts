/**
 * Review API Route Handler - Salon Reviews
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://probeauty-backend.onrender.com/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ salonId: string }> },
) {
  try {
    const { salonId } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "100";

    const response = await fetch(
      `${API_BASE_URL}/reviews/salon/${salonId}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        "Failed to fetch salon reviews:",
        response.statusText,
        errorData,
      );
      return NextResponse.json(
        {
          message: errorData.message || "Failed to fetch reviews",
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

    const data = await response.json();

    // Ensure the response has the expected structure
    return NextResponse.json({
      message: data.message || "Reviews retrieved successfully",
      data: data.data || [],
      averageRating: data.averageRating || 0,
      pagination: data.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        totalPages: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching salon reviews:", error);
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
