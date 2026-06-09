import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { message: "date is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/staff/${id}/availability-for-date?date=${date}`,
    );
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching staff availability:", error);
    return NextResponse.json(
      { message: "Failed to fetch staff availability" },
      { status: 500 },
    );
  }
}
