import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET(
  request: Request,
  props: { params: Promise<{ salonId: string }> },
) {
  const params = await props.params;
  try {
    console.log("\n=== FETCHING STAFF FROM STAFF API ===");
    console.log(`Salon ID: ${params.salonId}`);

    // Use the dedicated Staff API endpoint
    const url = `${BACKEND_URL}/staff/salon/${params.salonId}`;
    console.log(`Request URL: ${url}`);

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

    console.log(`Full URL with params: ${fullUrl}`);

    const response = await fetch(fullUrl, {
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
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log(
      `✅ Successfully fetched ${data.data?.length || 0} staff members`,
    );

    // Log sample staff member structure for debugging
    if (data.data && data.data.length > 0) {
      console.log("\n📋 Sample staff member structure:");
      const sample = data.data[0];
      console.log(`  Staff ID: ${sample.id}`);
      console.log(`  Name: ${sample.name || sample.user?.name || "Unknown"}`);
      console.log(`  Services count: ${sample.services?.length || 0}`);
      if (sample.services && sample.services.length > 0) {
        console.log(
          `  Sample service structure:`,
          JSON.stringify(sample.services[0], null, 2),
        );
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
