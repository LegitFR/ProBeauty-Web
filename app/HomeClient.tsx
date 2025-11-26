"use client";

import { useState } from "react";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { FeaturesOverview } from "../components/FeaturesOverview";
import { Shop } from "../components/Shop";
import { SalonBooking } from "../components/SalonBooking";
import { BusinessListing } from "../components/BusinessListing";
import { AppDownload } from "../components/AppDownload";
import { Testimonials } from "../components/Testimonials";
import { Newsletter } from "../components/Newsletter";
import { Footer } from "../components/Footer";
import { CartProvider } from "../components/CartContext";
import { WishlistProvider } from "../components/WishlistContext";
import { Toaster } from "../components/Toaster";
import { BookingFlow } from "../components/BookingFlow";
import { DisplayProduct } from "../lib/api/products";

interface HomeClientProps {
  products: DisplayProduct[];
}

export default function HomeClient({ products }: HomeClientProps) {
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);

  const handleBookAppointment = (salonId: number) => {
    setSelectedSalonId(salonId);
    setShowBookingFlow(true);
    // Scroll to top when opening booking flow
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseBookingFlow = () => {
    setShowBookingFlow(false);
    setSelectedSalonId(null);
  };

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-black overflow-x-hidden">
          {!showBookingFlow && <Header />}
          <main className="overflow-x-hidden">
            {showBookingFlow ? (
              <BookingFlow onClose={handleCloseBookingFlow} />
            ) : (
              <>
                <Hero />
                <FeaturesOverview />
                <div className="bg-body">
                  <Shop apiProducts={products} />
                  <SalonBooking onBookAppointment={handleBookAppointment} />
                  <BusinessListing />
                  <AppDownload />
                  <Testimonials />
                  <Newsletter />
                </div>
              </>
            )}
          </main>
          {!showBookingFlow && <Footer />}
          <Toaster />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
