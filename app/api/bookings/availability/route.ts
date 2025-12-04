import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://probeauty-backend.onrender.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = `${BACKEND_URL}/api/v1/bookings/availability?${searchParams.toString()}`;

    console.log(
      `Fetching availability with params: ${searchParams.toString()}`
    );
    console.log(`Request URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${errorText}`);
      return NextResponse.json(
        { message: `Backend returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched availability slots`);
    console.log(`Response data:`, JSON.stringify(data, null, 2));
    console.log(`Number of slots:`, data?.data?.slots?.length || 0);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { message: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
