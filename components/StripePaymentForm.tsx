/**
 * Stripe Payment Form Component
 * Handles Stripe Elements payment processing
 */

"use client";

import { useState, FormEvent } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface StripePaymentFormProps {
  orderId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({
  orderId,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet. Please wait.");
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?orderId=${orderId}`,
        },
      });

      if (error) {
        // Payment failed
        console.error("Payment error:", error);
        toast.error(error.message || "Payment failed. Please try again.");
        onError(error.message || "Payment failed");
      } else {
        // Payment succeeded - user will be redirected by Stripe
        onSuccess();
      }
    } catch (err: any) {
      console.error("Payment exception:", err);
      toast.error("An unexpected error occurred. Please try again.");
      onError(err.message || "Unexpected error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border-2 border-gray-300 rounded-xl bg-white">
        <PaymentElement />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            <span>Pay Now - Secure Payment</span>
          </div>
        )}
      </Button>

      <p className="text-xs text-center text-gray-600">
        By clicking "Pay Now", you agree to complete the purchase. Your payment
        will be processed securely by Stripe.
      </p>
    </form>
  );
}
