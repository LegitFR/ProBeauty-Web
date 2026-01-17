"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { Toaster } from "@/components/Toaster";
import { AuthModal } from "@/components/AuthModal";
import { getSalons, type Salon } from "@/lib/api/salon";
import { isAuthenticated } from "@/lib/api/auth";
import { Star, Calendar, Badge as BadgeIcon, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOffers } from "@/lib/hooks/useOffers";
import { OfferBadge } from "@/components/OfferBadge";

export default function SalonsPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<boolean | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all active offers
  const { offers: allOffers } = useOffers();

  useEffect(() => {
    setMounted(true);

    if (!isAuthenticated()) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }

    loadSalons();
  }, [currentPage, filterVerified]);

  const loadSalons = async () => {
    setLoading(true);
    try {
      const response = await getSalons({
        page: currentPage,
        limit: 12,
        verified: filterVerified,
      });
      setSalons(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load salons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClose = () => {
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setShowAuthModal(false);
      loadSalons();
    }
  };

  const filteredSalons = salons.filter((salon) =>
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get offers for a specific salon
  const getSalonOffers = (salonId: string) => {
    return allOffers.filter(
      (offer) => offer.salonId === salonId && offer.offerType === "salon",
    );
  };

  const getDayStatus = (salon: Salon) => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    const hours = salon.hours?.[today];
    if (!hours) return "Closed";
    return `${hours.open} - ${hours.close}`;
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#ECE3DC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F44A01]"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-[#ECE3DC]">
          <Header />

          {showAuthModal && (
            <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} />
          )}

          {/* Hero Section */}
          <section className="relative bg-linear-to-r from-[#4D1C00] via-[#792800] to-[#F44A01] py-20 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 mt-20">
                  Discover Premier Salons
                </h1>
                <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                  Find the perfect salon for your beauty needs. From haircuts to
                  spa treatments, we've got you covered.
                </p>
              </div>
            </div>
          </section>

          {/* Search and Filter Section */}
          <section className="bg-[#ECE3DC] shadow-md sticky top-0 z-40 border-b-2 border-[#CBCBCB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search salons by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-6 w-full border-2 border-[#1E1E1E] focus:border-[#F44A01] rounded-lg bg-[#ECE3DC] text-[#1E1E1E]"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={
                      filterVerified === undefined ? "default" : "outline"
                    }
                    onClick={() => setFilterVerified(undefined)}
                    className={
                      filterVerified === undefined
                        ? "bg-[#F44A01] hover:bg-[#FF6A00] text-[#ECE3DC]"
                        : "border-2 border-[#1E1E1E] hover:bg-[#CBCBCB]"
                    }
                  >
                    All Salons
                  </Button>
                  <Button
                    variant={filterVerified === true ? "default" : "outline"}
                    onClick={() => setFilterVerified(true)}
                    className={
                      filterVerified === true
                        ? "bg-[#F44A01] hover:bg-[#FF6A00] text-[#ECE3DC]"
                        : "border-2 border-[#1E1E1E] hover:bg-[#CBCBCB]"
                    }
                  >
                    <BadgeIcon className="h-4 w-4 mr-2" />
                    Verified
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-sm text-[#616161]">
                Showing {filteredSalons.length} of {salons.length} salons
              </div>
            </div>
          </section>

          {/* Salons Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {filteredSalons.length === 0 ? (
              <Card className="p-12 text-center bg-[#ECE3DC] border-4 border-[#1E1E1E]">
                <CardContent>
                  <div className="text-[#616161] mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#1E1E1E] mb-2">
                    No Salons Found
                  </h3>
                  <p className="text-[#616161]">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-4">
                {filteredSalons.map((salon, index) => {
                  const salonOffers = getSalonOffers(salon.id);
                  const hasOffers = salonOffers.length > 0;

                  return (
                    <Card
                      key={salon.id}
                      className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col cursor-pointer group"
                      onClick={() => router.push(`/salons/${salon.id}/book`)}
                    >
                      {/* Image Section */}
                      <div className="relative aspect-video overflow-hidden bg-transparent p-4">
                        <img
                          src={
                            salon.thumbnail ||
                            (salon.images && salon.images.length > 0
                              ? salon.images[0]
                              : "")
                          }
                          alt={salon.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
                        />

                        {/* Active Offers Badge */}
                        {hasOffers && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-gradient-to-r from-[#F44A01] to-[#FF6A00] text-white border-0 text-xs font-semibold shadow-md">
                              <Tag className="w-3 h-3 mr-1" />
                              {salonOffers.length}{" "}
                              {salonOffers.length === 1 ? "Offer" : "Offers"}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-3 flex flex-col grow">
                        {/* Salon Name */}
                        <h3 className="text-base font-semibold text-[#1E1E1E] leading-tight line-clamp-2 mb-2">
                          {salon.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm font-medium text-[#1E1E1E]">
                            4.5
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < 4
                                    ? "fill-[#F44A01] text-[#F44A01]"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-[#616161]">(1200)</span>
                        </div>

                        {/* Location */}
                        <p className="text-sm text-[#1E1E1E] mb-2 line-clamp-2">
                          {salon.address}
                        </p>

                        {/* Badge */}
                        <p className="text-xs text-[#616161] mb-2">
                          {salon.verified ? "verified salon" : "beauty salon"}
                        </p>
                      </CardContent>

                      {/* Book Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/salons/${salon.id}/book`);
                        }}
                        className="w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 bg-[#1E1E1E] hover:bg-[#2a2a2a] text-[#ECE3DC] font-medium text-xs p-7"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Book Appointment
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="border-2 border-[#1E1E1E] hover:bg-[#CBCBCB]"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-[#F44A01] hover:bg-[#FF6A00] text-[#ECE3DC]"
                          : "border-2 border-[#1E1E1E] hover:bg-[#CBCBCB]"
                      }
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="border-2 border-[#1E1E1E] hover:bg-[#CBCBCB]"
                >
                  Next
                </Button>
              </div>
            )}
          </section>

          <Footer />
          <Toaster />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
