/**
 * If-Then Pay CCARD Payment Form Component
 * Handles CCARD payment processing via external payment URL
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { CCARDPaymentResponse } from "@/lib/types/ifthenpay";

interface IfThenPayCCARDFormProps {
  payment: CCARDPaymentResponse;
  orderId?: string;
  bookingId?: string;
  onSuccess?: () => void;
}

export function IfThenPayCCARDForm({
  payment,
  orderId,
  bookingId,
  onSuccess,
}: IfThenPayCCARDFormProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayNow = () => {
    setIsRedirecting(true);
    toast.success("Redirecting to secure payment page...");

    // Open payment URL in same window
    window.location.href = payment.paymentUrl;

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Information Card */}
      <div className="p-6 border-2 border-gray-300 rounded-xl bg-white">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-[#FF6A00] rounded-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">
              Credit Card Payment
            </h3>
            <p className="text-sm text-gray-600">
              You'll be redirected to a secure payment page to complete your
              transaction
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-semibold text-[#1E1E1E]">Credit Card</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Reference</span>
            <span className="font-mono text-sm font-semibold text-[#FF6A00]">
              {payment.reference}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Pending Payment
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <Button
        onClick={handlePayNow}
        disabled={isRedirecting}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
      >
        {isRedirecting ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Redirecting...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            <span>Proceed to Payment</span>
            <ExternalLink className="h-4 w-4" />
          </div>
        )}
      </Button>

      {/* Security Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border-2 border-blue-200 p-3 rounded-lg">
          <svg
            className="h-4 w-4 text-blue-600 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            <strong>What happens next:</strong> You'll be redirected to a secure
            If-Then Pay payment page. After completing payment, you'll be
            redirected back to see your confirmation.
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-center text-gray-600">
          <Lock className="h-4 w-4 text-green-600" />
          <span>
            Your payment is secured by If-Then Pay. We never store your card
            details.
          </span>
        </div>
      </div>

      <p className="text-xs text-center text-gray-600">
        By clicking "Proceed to Payment", you agree to complete the purchase.
        Your payment will be processed securely by If-Then Pay.
      </p>
    </div>
  );
}
