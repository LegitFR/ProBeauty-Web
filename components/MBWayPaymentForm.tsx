/**
 * If-Then Pay MB WAY Payment Form Component
 * Handles MB WAY payment processing with status polling
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Smartphone,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { MBWayPaymentResponse } from "@/lib/types/ifthenpay";

interface MBWayPaymentFormProps {
  payment?: MBWayPaymentResponse;
  orderId?: string;
  bookingId?: string;
  amount?: string | number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onInitiatePayment?: (mobileNumber: string) => Promise<void>;
  isInitiating?: boolean;
}

export function MBWayPaymentForm({
  payment,
  orderId,
  bookingId,
  amount,
  onSuccess,
  onError,
  onInitiatePayment,
  isInitiating = false,
}: MBWayPaymentFormProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("351");
  const [pollCount, setPollCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "waiting" | "success" | "failed"
  >(payment ? "waiting" : "idle");

  // Format mobile number for display
  const formatMobileNumber = () => {
    if (payment?.mobileNumber) {
      const parts = payment.mobileNumber.split("#");
      return parts.length === 2 ? parts[1] : payment.mobileNumber;
    }
    return "";
  };

  // Validate mobile number format
  const validateMobileNumber = () => {
    const numberPattern = /^\d{6,15}$/;
    const countryCodePattern = /^\d{1,4}$/;

    if (!countryCodePattern.test(countryCode)) {
      toast.error("Invalid country code");
      return false;
    }

    if (!numberPattern.test(mobileNumber)) {
      toast.error("Mobile number must be 6-15 digits");
      return false;
    }

    return true;
  };

  // Handle payment initiation
  const handleInitiatePayment = async () => {
    if (!validateMobileNumber()) {
      return;
    }

    const formattedNumber = `${countryCode}#${mobileNumber}`;

    if (onInitiatePayment) {
      try {
        await onInitiatePayment(formattedNumber);
        setPaymentStatus("waiting");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to initiate MB WAY payment";
        toast.error(message);
        onError(message);
      }
    }
  };

  // Poll payment status
  useEffect(() => {
    if (!payment || paymentStatus !== "waiting") {
      return;
    }

    const maxPolls = 60; // Poll for 2 minutes (60 * 2 seconds)

    const pollPaymentStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/payments/mbway/poll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reference: payment.reference,
            requestId: payment.requestId,
            amount,
            orderId,
            bookingId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment status");
        }

        const data = await response.json();

        if (data.status === "succeeded") {
          setPaymentStatus("success");
          clearInterval(intervalId);
          toast.success("Payment confirmed! Redirecting...");
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          clearInterval(intervalId);
          toast.error("Payment failed. Please try again.");
          onError("Payment was declined or cancelled");
        }

        setPollCount((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= maxPolls) {
            clearInterval(intervalId);
            toast.error(
              "Payment confirmation timeout. Please check your order status."
            );
            onError("Payment confirmation timeout");
          }
          return nextCount;
        });
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    };

    // Start polling
    const intervalId = setInterval(pollPaymentStatus, 2000); // Poll every 2 seconds

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [payment, paymentStatus, pollCount, amount, orderId, bookingId, onSuccess, onError]);

  // Show payment initiation form if no payment yet
  if (!payment) {
    return (
      <div className="space-y-6">
        <div className="p-6 border-2 border-gray-300 rounded-xl bg-[#ECE3DC]">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-[#FF6A00] rounded-lg">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">
                MB WAY Payment
              </h3>
              <p className="text-sm text-gray-600">
                Enter your MB WAY mobile number to complete payment
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="countryCode" className="text-[#1E1E1E] font-medium">
                  Country
                </Label>
                <Input
                  id="countryCode"
                  type="text"
                  placeholder="351"
                  value={countryCode}
                  onChange={(e) =>
                    setCountryCode(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={4}
                  className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="mobileNumber" className="text-[#1E1E1E] font-medium">
                  Mobile Number *
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="912345678"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={15}
                  className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Format: Country code (e.g., 351 for Portugal) + Mobile number
            </p>
          </div>
        </div>

        <Button
          onClick={handleInitiatePayment}
          disabled={isInitiating || !mobileNumber}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
        >
          {isInitiating ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Initiating Payment...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              <span>Send MB WAY Request</span>
            </div>
          )}
        </Button>

        <p className="text-xs text-center text-gray-600">
          You&apos;ll receive a notification on your MB WAY app to approve the payment
        </p>
      </div>
    );
  }

  // Show payment waiting/status screen
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#1E1E1E] bg-[#ECE3DC] p-5 sm:p-6 text-[#1E1E1E] shadow-2xl">

        <div className="relative z-10 flex items-start gap-4">
          <div
            className={`rounded-xl p-3 shadow-lg ${
              paymentStatus === "success"
                ? "bg-green-500"
                : paymentStatus === "failed"
                  ? "bg-red-500"
                  : "bg-[#FF6A00]"
            }`}
          >
            {paymentStatus === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-white" />
            ) : paymentStatus === "failed" ? (
              <XCircle className="h-6 w-6 text-white" />
            ) : (
              <Smartphone className="h-6 w-6 text-white" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-[#FF6A00] mb-1">
              MB WAY Secure Checkout
            </p>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">
              {paymentStatus === "success"
                ? "Payment Confirmed"
                : paymentStatus === "failed"
                  ? "Payment Not Completed"
                  : "Awaiting Your Approval"}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-700">
              {paymentStatus === "success"
                ? "Great news! Your payment has been successfully confirmed."
                : paymentStatus === "failed"
                  ? "We could not confirm this payment. You can retry in a moment."
                  : payment.message}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#ECE3DC] border border-[#1E1E1E]/20 p-3">
            <p className="text-[11px] uppercase tracking-wide text-[#FF6A00]">
              Mobile
            </p>
            <p className="mt-1 font-semibold text-sm sm:text-base truncate">
              {formatMobileNumber()}
            </p>
          </div>
          <div className="rounded-xl bg-[#ECE3DC] border border-[#1E1E1E]/20 p-3 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-[#FF6A00]">
              Payment Reference
            </p>
            <p className="mt-1 font-mono font-semibold text-sm sm:text-base break-all">
              {payment.reference}
            </p>
          </div>
        </div>
      </div>

      {paymentStatus === "waiting" && (
        <div className="rounded-2xl border-2 border-[#1E1E1E] bg-[#ECE3DC] p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#1E1E1E] font-semibold">
              <Loader2 className="h-5 w-5 text-[#FF6A00] animate-spin" />
              Processing Your Payment
            </div>
            <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold">
              Pending Approval
            </span>
          </div>

          <div className="h-2 rounded-full bg-[#1E1E1E]/10 overflow-hidden">
            <div
              className="h-full bg-[#FF6A00] transition-all duration-500"
              style={{ width: `${Math.min((pollCount / 60) * 100, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border border-black/15 bg-[#ECE3DC] p-3">
              <p className="font-semibold text-[#1E1E1E]">1. Open app</p>
              <p className="text-xs text-gray-600 mt-1">Launch MB WAY on your phone</p>
            </div>
            <div className="rounded-lg border border-black/15 bg-[#ECE3DC] p-3">
              <p className="font-semibold text-[#1E1E1E]">2. Review request</p>
              <p className="text-xs text-gray-600 mt-1">Check amount and merchant details</p>
            </div>
            <div className="rounded-lg border border-black/15 bg-[#ECE3DC] p-3">
              <p className="font-semibold text-[#1E1E1E]">3. Approve</p>
              <p className="text-xs text-gray-600 mt-1">Confirm payment in MB WAY</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700">
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-green-600" />
              <span>Securely processed by If-Then Pay</span>
            </div>
            <span className="font-medium">{pollCount}/60 checks</span>
          </div>
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="rounded-2xl border-2 border-green-300 bg-[#ECE3DC] p-5 text-center shadow-lg">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-bold text-lg">Payment confirmed</p>
          <p className="text-green-700 text-sm mt-1">Redirecting to your confirmation page...</p>
        </div>
      )}

      {paymentStatus === "failed" && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-red-300 bg-[#ECE3DC] p-5 text-center shadow-lg">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
            <p className="text-red-800 font-bold text-lg">Payment failed</p>
            <p className="text-red-700 text-sm mt-1">
              The payment was declined or cancelled in your MB WAY app.
            </p>
          </div>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
