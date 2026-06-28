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

    // Use the dedicated Staff API endpoint
    const url = `${BACKEND_URL}/staff/salon/${params.salonId}`;

    // Get query parameters (page, limit)
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    // Add query parameters if present
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);

    const fullUrl = queryParams.toString()
      ? `${url}?${queryParams.toString()}`
      : url;


    const response = await fetch(fullUrl, {
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

    // Log sample staff member structure for debugging
    if (data.data && data.data.length > 0) {
      const sample = data.data[0];
      if (sample.services && sample.services.length > 0) {
      }
    }

    // Return staff data directly from the Staff API
    return NextResponse.json(
      {
        message: data.message || "Staff fetched successfully",
        data: data.data || [],
        pagination: data.pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error fetching salon staff:", error);
    return NextResponse.json(
      { message: "Failed to fetch salon staff" },
      { status: 500 },
    );
  }
}
