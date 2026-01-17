import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://probeauty-backend.onrender.com/api/v1";

// Timeout duration in milliseconds (10 seconds)
const FETCH_TIMEOUT = 10000;

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const unreadOnly = searchParams.get("unreadOnly");

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(unreadOnly && { unreadOnly }),
    });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(
        `${BACKEND_URL}/notifications?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            message: data.message || "Failed to fetch notifications",
          },
          { status: response.status },
        );
      }

      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      // Handle timeout specifically
      if (fetchError.name === "AbortError") {
        console.error("Notification fetch timeout:", BACKEND_URL);
        return NextResponse.json(
          {
            success: false,
            message:
              "Request timed out. The backend server may be slow or unavailable.",
            notifications: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          },
          { status: 504 },
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("Error fetching notifications:", error);

    // Return empty notifications instead of error to prevent UI crashes
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
        notifications: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      { status: 500 },
    );
  }
}
