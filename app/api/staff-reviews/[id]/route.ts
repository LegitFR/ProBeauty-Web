import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

// GET - Get staff review by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/staff-reviews/${id}`);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching staff review:", error);
    return NextResponse.json(
      { message: "Failed to fetch staff review" },
      { status: 500 },
    );
  }
}

// PATCH - Update staff review
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/staff-reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating staff review:", error);
    return NextResponse.json(
      { message: "Failed to update staff review" },
      { status: 500 },
    );
  }
}

// DELETE - Delete staff review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/staff-reviews/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting staff review:", error);
    return NextResponse.json(
      { message: "Failed to delete staff review" },
      { status: 500 },
    );
  }
}
