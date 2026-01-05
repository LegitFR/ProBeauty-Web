/**
 * Custom hook to poll order status
 * Used to check when payment is confirmed by webhook
 */

import { useState, useEffect } from "react";
import { getOrderById, type Order } from "@/lib/api/order";

interface UseOrderStatusReturn {
  order: Order | null;
  status: string;
  loading: boolean;
  error: string | null;
}

export function useOrderStatus(
  orderId: string | null,
  token: string | null,
  enabled: boolean = true
): UseOrderStatusReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("PAYMENT_PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !token || !enabled) {
      setLoading(false);
      return;
    }

    let isActive = true;

    const pollStatus = async () => {
      try {
        const response = await getOrderById(token, orderId);

        if (!isActive) return;

        setOrder(response.data);
        setStatus(response.data.status);

        // Stop polling when order is confirmed or failed
        if (
          response.data.status === "CONFIRMED" ||
          response.data.status === "PAYMENT_FAILED" ||
          response.data.status === "CANCELLED"
        ) {
          setLoading(false);
          return true; // Signal to stop polling
        }

        return false; // Continue polling
      } catch (err: any) {
        if (!isActive) return;
        console.error("Error polling order status:", err);
        setError(err.message || "Failed to fetch order status");
        return false;
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Stop after 60 seconds (timeout)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      if (status === "PAYMENT_PENDING") {
        setError(
          "Payment confirmation timeout. Please check your order status."
        );
      }
    }, 60000);

    return () => {
      isActive = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId, token, enabled]);

  return { order, status, loading, error };
}
