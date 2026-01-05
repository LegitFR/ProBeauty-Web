"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Loader2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useOrderStatus } from "@/lib/hooks/useOrderStatus";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Get token from localStorage
    const accessToken = localStorage.getItem("accessToken");
    setToken(accessToken);
  }, []);

  // Poll order status to check if payment is confirmed
  const { order, status, loading, error } = useOrderStatus(
    orderId,
    token,
    mounted && !!orderId
  );

  if (!mounted) {
    return null;
  }

  const isPaymentConfirmed = status === "CONFIRMED";
  const isPaymentFailed = status === "PAYMENT_FAILED" || status === "CANCELLED";
  const isPaymentPending = status === "PAYMENT_PENDING" && loading;

  return (
    <div className="min-h-screen bg-[#ECE3DC]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`shadow-xl`}>
            <CardContent className="pt-8 pb-8 text-center bg-[#ECE3DC] rounded-lg">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                {isPaymentPending && (
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-orange-600 animate-spin" />
                  </div>
                )}
                {isPaymentConfirmed && (
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                  </div>
                )}
                {isPaymentFailed && (
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-16 h-16 text-red-600" />
                  </div>
                )}
              </motion.div>

              {isPaymentPending && (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E] mb-4">
                    Confirming Your Payment...
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    Please wait while we confirm your payment with our payment
                    provider.
                  </p>
                </>
              )}

              {isPaymentConfirmed && (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E] mb-4">
                    Payment Confirmed! 🎉
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you for your order. Your payment has been confirmed
                    and your order is being processed.
                  </p>
                </>
              )}

              {isPaymentFailed && (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1E1E1E] mb-4">
                    Payment Failed
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    Unfortunately, your payment could not be processed. Please
                    try again or contact support.
                  </p>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 inline-block">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="text-lg font-mono font-semibold text-[#FF6A00]">
                    {orderId}
                  </p>
                  {order && (
                    <p className="text-sm text-gray-500 mt-2">
                      Status: <span className="font-semibold">{status}</span>
                    </p>
                  )}
                </div>
              )}

              {!isPaymentPending && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                  {orderId && isPaymentConfirmed && (
                    <Link href={`/profile?tab=orders&orderId=${orderId}`}>
                      <Button
                        className="bg-[#FF6A00] hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                      >
                        <Package className="mr-2 h-5 w-5" />
                        View Order Details
                      </Button>
                    </Link>
                  )}

                  <Link href="/">
                    <Button
                      variant="outline"
                      className="border-2 border-[#FF6A00] text-[#FF6A00] hover:text-white px-8 py-6 text-lg font-semibold"
                      size="lg"
                    >
                      {isPaymentFailed ? "Try Again" : "Continue Shopping"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}

              {isPaymentConfirmed && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to your registered email
                    address.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ECE3DC] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
