import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://probeauty-backend.onrender.com";

export async function GET(
  request: Request,
  props: { params: Promise<{ salonId: string }> }
) {
  const params = await props.params;
  try {
    console.log(`Fetching services for salon: ${params.salonId}`);
    const url = `${BACKEND_URL}/api/v1/services?salonId=${params.salonId}`;
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

    // Ensure data.data is always an array
    if (!Array.isArray(data.data)) {
      console.warn("Services data is not an array, converting to empty array");
      data.data = [];
    }

    console.log(`Successfully fetched ${data.data.length} services`);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching salon services:", error);
    return NextResponse.json(
      {
        message: `Failed to fetch salon services: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
