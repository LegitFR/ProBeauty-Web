import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

// GET - Get reviews for a staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const response = await fetch(
      `${BACKEND_URL}/staff-reviews/staff/${id}?page=${page}&limit=${limit}`,
    );
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching staff reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch staff reviews" },
      { status: 500 },
    );
  }
}
