/**
 * Custom hook to poll booking status
 * Used to check when payment is confirmed by webhook
 */

import { useState, useEffect } from "react";
import { getBookingById, type Booking } from "@/lib/api/booking";

interface UseBookingStatusReturn {
  booking: Booking | null;
  status: string;
  loading: boolean;
  error: string | null;
}

export function useBookingStatus(
  bookingId: string | null,
  token: string | null,
  enabled: boolean = true
): UseBookingStatusReturn {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState<string>("PAYMENT_PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId || !token || !enabled) {
      setLoading(false);
      return;
    }

    let isActive = true;

    const pollStatus = async () => {
      try {
        const response = await getBookingById(token, bookingId);

        if (!isActive) return;

        setBooking(response.data);
        setStatus(response.data.status);

        // Stop polling when booking is confirmed or failed
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

        console.error("Error polling booking status:", err);
        setError(err.message || "Failed to fetch booking status");
        return false;
      }
    };

    // Initial poll
    pollStatus();

    // Set up polling interval (every 2 seconds)
    const pollInterval = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop) {
        clearInterval(pollInterval);
      }
    }, 2000);

    // Stop polling after 60 seconds (timeout)
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (isActive) {
        setLoading(false);
        setError("Timeout: Unable to confirm payment status");
      }
    }, 60000);

    return () => {
      isActive = false;
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [bookingId, token, enabled]);

  return { booking, status, loading, error };
}
