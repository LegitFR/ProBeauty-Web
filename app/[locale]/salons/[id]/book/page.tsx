"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookingFlow } from "@/components/BookingFlow";
import { AuthModal } from "@/components/AuthModal";
import { getSalonById, type Salon } from "@/lib/api/salon";
import { isAuthenticated } from "@/lib/api/auth";
import { CartProvider } from "@/components/CartContext";
import { Loader2, Lock } from "lucide-react";

export default function BookingSalonPage() {
  const params = useParams();
  const router = useRouter();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsUserAuthenticated(authenticated);

    if (!authenticated) {
      setShowAuthModal(true);
    }
  }, []);

  useEffect(() => {
    const loadSalon = async () => {
      try {
        const salonId = params.id as string;
        const response = await getSalonById(salonId);
        setSalon(response.data);
      } catch (err) {
        console.error("Failed to load salon:", err);
        setError("Failed to load salon details");
      } finally {
        setLoading(false);
      }
    };

    loadSalon();
  }, [params.id]);

  const handleClose = () => {
    router.push("/salons");
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsUserAuthenticated(true);
  };

  const handleAuthClose = () => {
    // If user closes auth modal without logging in, redirect back to salons
    router.push("/salons");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl">
          <Loader2 className="h-12 w-12 animate-spin text-[#FF7A00] mx-auto" />
          <p className="mt-4 text-gray-600">Loading salon details...</p>
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl text-center">
          <p className="text-red-600 mb-4">{error || "Salon not found"}</p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Back to Salons
          </button>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated - wrapped in CartProvider
  if (!isUserAuthenticated) {
    return (
      <CartProvider>
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-[#FF7A00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-[#FF7A00]" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-3">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to book an appointment at {salon.name}
            </p>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onLoginSuccess={handleAuthSuccess}
        />
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <BookingFlow salon={salon} onClose={handleClose} />
    </CartProvider>
  );
}
