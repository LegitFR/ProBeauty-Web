import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://probeauty-backend.onrender.com";

export async function GET(
  request: Request,
  props: { params: Promise<{ salonId: string }> }
) {
  const params = await props.params;
  try {
    console.log(`Fetching staff for salon: ${params.salonId}`);
    const url = `${BACKEND_URL}/api/v1/salons/${params.salonId}`;
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
    console.log(`Successfully fetched ${data.data?.length || 0} staff members`);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching salon staff:", error);
    return NextResponse.json(
      { message: "Failed to fetch salon staff" },
      { status: 500 }
    );
  }
}
