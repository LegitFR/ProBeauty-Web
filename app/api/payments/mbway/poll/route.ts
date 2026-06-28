import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatusBackendCandidates } from "@/lib/config/backend";

function formatIfThenPayDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function normalizeAmount(amount: string | number) {
  if (typeof amount === "number") {
    return amount.toFixed(2);
  }

  const parsed = Number(amount);
  if (Number.isFinite(parsed)) {
    return parsed.toFixed(2);
  }

  return String(amount);
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
    }

    const antiPhishingKey = process.env.IFTHENPAY_ANTI_PHISHING_KEY;
    if (!antiPhishingKey) {
      return NextResponse.json(
        { message: "Missing IFTHENPAY_ANTI_PHISHING_KEY on server" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      reference?: string;
      requestId?: string;
      amount?: string | number;
    };

    if (!body.reference || !body.requestId || body.amount === undefined) {
      return NextResponse.json(
        {
          message:
            "reference, requestId, and amount are required for MB WAY polling",
        },
        { status: 400 },
      );
    }

    const query = new URLSearchParams({
      key: antiPhishingKey,
      orderId: body.reference,
      requestId: body.requestId,
      amount: normalizeAmount(body.amount),
      payment_datetime: formatIfThenPayDate(new Date()),
    }).toString();

    const backendCandidates = getPaymentStatusBackendCandidates();

    for (const backendUrl of backendCandidates) {
      try {
        const webhookUrl = `${backendUrl}/webhooks/ifthenpay/mbway?${query}`;
        const response = await fetch(webhookUrl, { method: "GET" });
        const text = await response.text();

        let data: Record<string, unknown> = {};
        try {
          data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
        } catch {
          data = { message: text };
        }

        if (response.ok) {
          const success = data.success === true;
          return NextResponse.json(
            {
              status: success ? "succeeded" : "pending",
              message:
                (typeof data.message === "string" && data.message) ||
                "MB WAY callback check completed",
              data,
            },
            { status: 200 },
          );
        }

        const message =
          (typeof data.message === "string" && data.message) ||
          "MB WAY payment still pending";

        return NextResponse.json(
          {
            status: "pending",
            message,
            data,
          },
          { status: 200 },
        );
      } catch {
      }
    }

    return NextResponse.json(
      {
        status: "pending",
        message: "Unable to reach MB WAY webhook backend",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to poll MB WAY payment status";

    return NextResponse.json(
      {
        status: "pending",
        message,
      },
      { status: 200 },
    );
  }
}
