import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!salonId || !date) {
      return NextResponse.json(
        { message: "salonId and date are required" },
        { status: 400 },
      );
    }

    const queryParams = new URLSearchParams({ salonId, date });
    if (serviceId) {
      queryParams.append("serviceId", serviceId);
    }

    const response = await fetch(
      `${BACKEND_URL}/staff/available-on-date?${queryParams}`,
    );
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching available staff:", error);
    return NextResponse.json(
      { message: "Failed to fetch available staff" },
      { status: 500 },
    );
  }
}
