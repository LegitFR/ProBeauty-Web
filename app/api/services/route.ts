import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { message: "Failed to create service" },
      { status: 500 }
    );
  }
}
