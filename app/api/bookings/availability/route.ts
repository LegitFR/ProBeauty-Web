import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://vps-9ebf5d76.vps.ovh.net:5000/api/v1";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = `${BACKEND_URL}/bookings/availability?${searchParams.toString()}`;


    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${errorText}`);
      return NextResponse.json(
        { message: `Backend returned ${response.status}: ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { message: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}
