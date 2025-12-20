"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturesOverview } from "@/components/FeaturesOverview";
import { Shop } from "@/components/Shop";
import { SalonBooking } from "@/components/SalonBooking";
import { BusinessListing } from "@/components/BusinessListing";
import { AppDownload } from "@/components/AppDownload";
import { Testimonials } from "@/components/Testimonials";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { Toaster } from "@/components/Toaster";
import { Salon } from "@/lib/api/salon";

export default function HomeClient() {
  const router = useRouter();

  const handleBookAppointment = (salon: Salon) => {
    // Navigate to the booking page
    router.push(`/salons/${salon.id}/book`);
  };

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-black overflow-x-hidden">
          <Header />
          <main className="overflow-x-hidden">
            <Hero />
            <FeaturesOverview />
            <div className="bg-body">
              <Shop />
              <SalonBooking onBookAppointment={handleBookAppointment} />
              <BusinessListing />
              <AppDownload />
              <Testimonials />
              <Newsletter />
            </div>
          </main>
          <Footer />
          <Toaster />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
