import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://vps-9ebf5d76.vps.ovh.net:5000/api/v1";

export async function GET(
  request: Request,
  props: { params: Promise<{ salonId: string }> },
) {
  const params = await props.params;
  try {
    const url = `${BACKEND_URL}/services?salonId=${params.salonId}`;

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

    // Ensure data.data is always an array
    if (!Array.isArray(data.data)) {
      console.warn("Services data is not an array, converting to empty array");
      data.data = [];
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching salon services:", error);
    return NextResponse.json(
      {
        message: `Failed to fetch salon services: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 },
    );
  }
}
