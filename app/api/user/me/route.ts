import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "https://probeauty-backend.onrender.com/api/v1";

async function proxyRequest(
  request: NextRequest,
  method: "GET" | "PATCH",
  body?: unknown,
) {
  const token = request.headers.get("authorization");

  if (!token) {
    return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
  }

  const response = await fetch(`${BACKEND_URL}/user/me`, {
    method,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  let data: Record<string, unknown> = {};

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = { message: text || "Invalid backend response" };
  }

  return NextResponse.json(data, { status: response.status });
}

export async function GET(request: NextRequest) {
  try {
    return await proxyRequest(request, "GET");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user profile";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    return await proxyRequest(request, "PATCH", body);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update user profile";
    return NextResponse.json({ message }, { status: 500 });
  }
}
