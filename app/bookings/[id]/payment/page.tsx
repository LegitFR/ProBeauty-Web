"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Loader2,
} from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe/config";
import { StripePaymentForm } from "@/components/StripePaymentForm";
import { motion } from "motion/react";
import Link from "next/link";

export default function BookingPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Retrieve booking details from sessionStorage
    const pendingBooking = sessionStorage.getItem("pendingBooking");
    if (pendingBooking) {
      const details = JSON.parse(pendingBooking);
      if (details.bookingId === bookingId) {
        setBookingDetails(details);
        setClientSecret(details.clientSecret);
      } else {
        // Booking ID mismatch, redirect back
        router.push("/");
      }
    } else {
      // No pending booking found, redirect back
      router.push("/");
    }
  }, [bookingId, router]);

  const handlePaymentSuccess = () => {
    // Clear pending booking from sessionStorage
    sessionStorage.removeItem("pendingBooking");
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
  };

  if (!mounted || !bookingDetails || !clientSecret) {
    return (
      <div className="min-h-screen bg-[#ECE3DC] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#ECE3DC]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-[#1E1E1E] hover:bg-[#CBCBCB]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-[#ECE3DC] border-2 border-[#1E1E1E] shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-[#1E1E1E] mb-4">
                    Booking Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#FF6A00] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Salon</p>
                        <p className="font-semibold text-[#1E1E1E]">
                          {bookingDetails.salonName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-[#FF6A00] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="font-semibold text-[#1E1E1E]">
                          {bookingDetails.serviceName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-[#FF6A00] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-[#1E1E1E]">
                          {formatDate(bookingDetails.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-[#FF6A00] mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-semibold text-[#1E1E1E]">
                          {formatTime(bookingDetails.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#1E1E1E]">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-[#FF6A00]">
                          ${bookingDetails.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card className="bg-[#ECE3DC] border-2 border-[#1E1E1E] shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">
                    Complete Payment
                  </h2>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#FF6A00",
                          //   colorBackground: "#ECE3DC",
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      bookingId={bookingId}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
