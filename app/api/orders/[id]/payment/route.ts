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
  orderId: string,
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
  console.log("Triggering MB WAY webhook recovery for order:", orderId);

  try {
    await fetch(webhookUrl, { method: "GET" });
  } catch {
    console.log("MB WAY webhook recovery call failed");
  }
}

async function fetchOrderPayments(backendUrl: string, orderId: string, token: string) {
  const response = await fetch(`${backendUrl}/orders/${orderId}/payment`, {
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
 * GET /api/orders/[id]/payment
 * Get payment details for an order
 * Tries ngrok backend first for MB WAY payments, falls back to regular backend
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
    
    console.log("=== PAYMENT STATUS CHECK ===");
    console.log("Order ID:", id);
    
    const backendCandidates = getPaymentStatusBackendCandidates();

    for (const backendUrl of backendCandidates) {
      try {
        console.log("Trying payment status backend:", backendUrl);
        const firstFetch = await fetchOrderPayments(backendUrl, id, token);

        if (firstFetch.response.ok) {
          const payments = getPaymentsFromResponse(firstFetch.data);
          await tryTriggerMbwayWebhookRecovery(backendUrl, id, payments);

          const secondFetch = await fetchOrderPayments(backendUrl, id, token);
          if (secondFetch.response.ok) {
            console.log("✅ Got payment data from backend:", backendUrl);
            return NextResponse.json(secondFetch.data, { status: 200 });
          }

          return NextResponse.json(
            {
              message:
                (typeof secondFetch.data.message === "string" &&
                  secondFetch.data.message) ||
                "Failed to fetch order payment details",
            },
            { status: secondFetch.response.status },
          );
        }

        console.log("Backend returned error, trying next if available...");
      } catch {
        console.log("Backend unreachable, trying next if available...");
      }
    }

    const fallbackUrl = backendCandidates[backendCandidates.length - 1];
    console.log("All backends failed. Returning last backend error from:", fallbackUrl);
    const { response, data } = await fetchOrderPayments(fallbackUrl, id, token);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            (typeof data.message === "string" && data.message) ||
            "Failed to fetch order payment details",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch order payment details";
    console.error("Error fetching order payment details:", error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
