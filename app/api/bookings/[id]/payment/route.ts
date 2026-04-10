import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatusBackendCandidates } from "@/lib/config/backend";

type PaymentRow = {
  status?: string;
  ifthenpayMethod?: string;
  method?: string;
  ifthenpayRequestId?: string;
  requestId?: string;
  txnId?: string;
  reference?: string;
  amount?: string | number;
};

function formatIfThenPayDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getPaymentsFromResponse(data: Record<string, unknown>): PaymentRow[] {
  const responseData = data.data;
  if (!Array.isArray(responseData)) {
    return [];
  }

  return responseData as PaymentRow[];
}

async function tryTriggerMbwayWebhookRecovery(
  backendUrl: string,
  bookingId: string,
  payments: PaymentRow[],
) {
  const antiPhishingKey = process.env.IFTHENPAY_ANTI_PHISHING_KEY;
  if (!antiPhishingKey) {
    return;
  }

  const pendingMbwayPayments = payments.filter((payment) => {
    const method = payment.ifthenpayMethod || payment.method;
    return method === "MBWAY" && payment.status === "pending";
  });

  if (pendingMbwayPayments.length === 0) {
    return;
  }

  const payment = pendingMbwayPayments[0];
  const requestId = payment.ifthenpayRequestId || payment.requestId;
  const txnId = payment.txnId || payment.reference;
  const amount = payment.amount;

  if (!requestId || !txnId || amount === undefined || amount === null) {
    return;
  }

  const searchParams = new URLSearchParams({
    key: antiPhishingKey,
    orderId: String(txnId),
    requestId: String(requestId),
    amount: String(amount),
    payment_datetime: formatIfThenPayDate(new Date()),
  });

  const webhookUrl = `${backendUrl}/webhooks/ifthenpay/mbway?${searchParams.toString()}`;
  console.log("Triggering MB WAY webhook recovery for booking:", bookingId);

  try {
    await fetch(webhookUrl, { method: "GET" });
  } catch {
    console.log("MB WAY webhook recovery call failed");
  }
}

async function fetchBookingPayments(backendUrl: string, bookingId: string, token: string) {
  const response = await fetch(`${backendUrl}/bookings/${bookingId}/payment`, {
    method: "GET",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  let data: Record<string, unknown> = {};

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = { message: "Invalid JSON response from backend" };
  }

  return { response, data };
}

/**
 * GET /api/bookings/[id]/payment
 * Get payment details for a booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const backendCandidates = getPaymentStatusBackendCandidates();

    for (const backendUrl of backendCandidates) {
      try {
        const firstFetch = await fetchBookingPayments(backendUrl, id, token);

        if (firstFetch.response.ok) {
          const payments = getPaymentsFromResponse(firstFetch.data);
          await tryTriggerMbwayWebhookRecovery(backendUrl, id, payments);

          const secondFetch = await fetchBookingPayments(backendUrl, id, token);
          if (secondFetch.response.ok) {
            return NextResponse.json(secondFetch.data, { status: 200 });
          }

          return NextResponse.json(
            {
              message:
                (typeof secondFetch.data.message === "string" &&
                  secondFetch.data.message) ||
                "Failed to fetch booking payment details",
            },
            { status: secondFetch.response.status },
          );
        }
      } catch {
        console.log("Booking payment backend unreachable, trying next if available...");
      }
    }

    return NextResponse.json(
      { message: "Failed to fetch booking payment details" },
      { status: 502 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch booking payment details";
    console.error("Error fetching booking payment details:", error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
