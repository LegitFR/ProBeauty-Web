import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://probeauty-backend.onrender.com/api/v1";

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/notifications/clear-all`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to clear all notifications",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
