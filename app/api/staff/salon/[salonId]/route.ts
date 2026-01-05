import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET(
  request: Request,
  props: { params: Promise<{ salonId: string }> }
) {
  const params = await props.params;
  try {
    console.log(`Fetching staff for salon: ${params.salonId}`);
    const url = `${BACKEND_URL}/salons/${params.salonId}`;
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

    // The salon endpoint returns { data: { ...salon, staff: [...] } }
    // We need to extract the staff array
    const salon = data.data;
    const staff = Array.isArray(salon?.staff) ? salon.staff : [];

    console.log(`Successfully fetched ${staff.length} staff members`);

    // Return staff in the expected format
    return NextResponse.json(
      { message: "Staff fetched successfully", data: staff },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching salon staff:", error);
    return NextResponse.json(
      { message: "Failed to fetch salon staff" },
      { status: 500 }
    );
  }
}
