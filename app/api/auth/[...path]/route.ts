/**
 * Auth API Proxy Route
 * This proxies requests to the backend API to avoid CORS issues
 * All requests to /api/auth/* will be forwarded to the backend
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://probeauty-backend.onrender.com/api/v1/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join("/");
    const body = await request.json();

    console.log(`[Proxy] POST /api/auth/${path} -> ${BACKEND_URL}/${path}`);
    console.log(`[Proxy] Request body:`, body);

    // Add timeout for slow backend responses (e.g., when server is waking up)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

    try {
      const response = await fetch(`${BACKEND_URL}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      console.log(`[Proxy] Response status: ${response.status}`);
      console.log(`[Proxy] Response data:`, data);

      // TODO: REMOVE - Temporary OTP logging for development
      if (path === "signup" && data.otp) {
        console.log("🔐 [DEV ONLY] OTP from backend:", data.otp);
      }
      // END TODO: REMOVE

      return NextResponse.json(data, { status: response.status });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[Proxy] Error:`, error);
    console.error(`[Proxy] Error cause:`, error.cause);

    // Provide user-friendly error messages
    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          message:
            "Request timeout. The backend server might be starting up. Please try again in a moment.",
        },
        { status: 504 }
      );
    }

    if (error.cause?.code === "UND_ERR_CONNECT_TIMEOUT") {
      return NextResponse.json(
        {
          message:
            "Backend server is waking up. Please wait a moment and try again.",
        },
        { status: 503 }
      );
    }

    if (error.cause?.code === "ENOTFOUND") {
      return NextResponse.json(
        {
          message:
            "Cannot connect to backend server. Please check your internet connection and try again.",
        },
        { status: 503 }
      );
    }

    if (error.cause?.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          message:
            "Backend server is not responding. Please try again in a few moments.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message:
          error.message ||
          "An error occurred connecting to the server. Please check your internet connection.",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join("/");
    const token = request.headers.get("authorization");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = token;
    }

    console.log(`[Proxy] GET /api/auth/${path} -> ${BACKEND_URL}/${path}`);

    const response = await fetch(`${BACKEND_URL}/${path}`, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    console.log(`[Proxy] Response status: ${response.status}`);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error(`[Proxy] Error:`, error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
