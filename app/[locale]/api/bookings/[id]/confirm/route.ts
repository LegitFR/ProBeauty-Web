import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const token = request.headers.get("authorization");

    const response = await fetch(
      `${BACKEND_URL}/api/v1/bookings/${params.id}/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      { message: "Failed to confirm booking" },
      { status: 500 }
    );
  }
}
