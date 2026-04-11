import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; serviceId: string }> },
) {
  try {
    const { id, serviceId } = await params;
    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get("startTime");

    if (!startTime) {
      return NextResponse.json(
        { message: "startTime is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/salons/${id}/services/${serviceId}/available-staff?startTime=${encodeURIComponent(startTime)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const text = await response.text();
    let data: Record<string, unknown> = {};

    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = { message: text || "Invalid backend response" };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch available staff";

    return NextResponse.json({ message }, { status: 500 });
  }
}
