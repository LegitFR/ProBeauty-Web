import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

// GET - Get current user's staff reviews
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const response = await fetch(
      `${BACKEND_URL}/staff-reviews/user/me?page=${page}&limit=${limit}`,
      {
        headers: {
          ...(token && { Authorization: token }),
        },
      },
    );
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching user staff reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch user staff reviews" },
      { status: 500 },
    );
  }
}
