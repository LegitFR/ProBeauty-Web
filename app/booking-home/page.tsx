"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Search,
  Calendar,
  Star,
  X,
  Filter,
  Mic,
  Tag,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { getSalons, type Salon } from "@/lib/api/salon";
import { useOffers } from "@/lib/hooks/useOffers";
import { getSalonReviews } from "@/lib/api/reviews-client";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const CATEGORIES = [
  { id: "all", name: "All", icon: "🎯" },
  { id: "haircut", name: "Haircut", icon: "✂️" },
  { id: "spa", name: "Spa", icon: "💆" },
  { id: "eyebrows", name: "Eyebrows", icon: "👁️" },
  { id: "makeup", name: "Makeup", icon: "💄" },
  { id: "tattoo", name: "Tattoo", icon: "🎨" },
  { id: "fitness", name: "Fitness", icon: "💪" },
];

export default function BookingHomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("Anytime");
  const [salonRatings, setSalonRatings] = useState<
    Record<string, { rating: number; count: number }>
  >({});

  // Fetch offers
  const { offers } = useOffers();

  // Initial load
  useEffect(() => {
    loadSalons();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadSalons();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchLocation]);

  // Category change (no debounce needed)
  useEffect(() => {
    loadSalons();
  }, [selectedCategory]);

  // Auto-rotate carousel
  useEffect(() => {
    if (offers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [offers.length]);

  const loadSalons = async () => {
    setLoading(true);
    try {
      const response = await getSalons({
        page: 1,
        limit: 50,
        verified: true,
      });
      let filteredSalons = response.data;

      // Client-side filtering for search
      if (searchLocation) {
        const searchLower = searchLocation.toLowerCase();
        filteredSalons = filteredSalons.filter(
          (salon) =>
            salon.name.toLowerCase().includes(searchLower) ||
            salon.address.toLowerCase().includes(searchLower) ||
            (salon.services &&
              salon.services.some((service: any) =>
                service.title?.toLowerCase().includes(searchLower),
              )),
        );
      }

      // Client-side category filtering
      if (selectedCategory !== "all") {
        const categoryLower = selectedCategory.toLowerCase();
        filteredSalons = filteredSalons.filter(
          (salon) =>
            salon.name.toLowerCase().includes(categoryLower) ||
            (salon.services &&
              salon.services.some(
                (service: any) =>
                  service.title?.toLowerCase().includes(categoryLower) ||
                  service.category?.toLowerCase().includes(categoryLower),
              )),
        );
      }

      setSalons(filteredSalons);

      // Fetch ratings for all filtered salons
      fetchSalonRatings(filteredSalons);
    } catch (error) {
      console.error("Failed to load salons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonRatings = async (salons: Salon[]) => {
    const ratingsMap: Record<string, { rating: number; count: number }> = {};

    await Promise.all(
      salons.map(async (salon) => {
        try {
          const reviewsData = await getSalonReviews(salon.id);
          ratingsMap[salon.id] = {
            rating: reviewsData.averageRating || 0,
            count: reviewsData.pagination?.total || reviewsData.data.length,
          };
        } catch (error) {
          console.error(
            `Failed to fetch ratings for salon ${salon.id}:`,
            error,
          );
          ratingsMap[salon.id] = { rating: 0, count: 0 };
        }
      }),
    );

    setSalonRatings(ratingsMap);
  };

  const handleSalonClick = (salonId: string) => {
    router.push(`/salons/${salonId}/book`);
  };

  const handleBookAppointment = (salonId: string) => {
    router.push(`/salons/${salonId}/book`);
  };

  const getSalonType = (salon: Salon): string => {
    if (!salon.services || salon.services.length === 0) {
      return "Beauty Salon";
    }

    // Determine salon type based on services
    const serviceNames = salon.services.map(
      (s: any) => s.title?.toLowerCase() || "",
    );

    if (serviceNames.some((s) => s.includes("hair") || s.includes("cut"))) {
      return "Hair Salon";
    }
    if (serviceNames.some((s) => s.includes("spa") || s.includes("massage"))) {
      return "Spa & Wellness";
    }
    if (
      serviceNames.some((s) => s.includes("nail") || s.includes("manicure"))
    ) {
      return "Nail Salon";
    }
    if (
      serviceNames.some((s) => s.includes("makeup") || s.includes("cosmetic"))
    ) {
      return "Beauty Studio";
    }

    return "Beauty Salon";
  };

  const getSalonImage = (salon: Salon) => {
    // Use thumbnail, first image, or fallback
    if (salon.thumbnail) return salon.thumbnail;
    if (salon.images && salon.images.length > 0) return salon.images[0];
    // Fallback image
    return "";
  };

  // Get offers for a specific salon
  const getSalonOffers = (salonId: string) => {
    return offers.filter(
      (offer) => offer.salonId === salonId && offer.offerType === "salon",
    );
  };

  const recommendedSalons = salons.slice(0, 3);
  const specialOfferSalons = salons
    .filter((salon) => getSalonOffers(salon.id).length > 0)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#ECE3DC]">
      {/* Header */}
      <header className="bg-[#ECE3DC] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              src="/probeauty-header-black.svg"
              alt="ProBeauty"
              width={150}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="bg-transparent hover:bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00] px-6 py-2 rounded-lg font-medium"
              onClick={() => router.push("/ecommerce-home")}
            >
              Shop Now
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-gray-200"
              onClick={() => router.push("/")}
            >
              <X className="h-5 w-5 text-[#1e1e1e]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#ECE3DC] rounded-2xl p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1e1e1e]" />
              <Input
                type="text"
                placeholder="Any treatment or venue"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-12 h-12 rounded-xl focus:border-[#FF6A00] focus:ring-[#FF6A00] bg-[#ECE3DC] shadow-lg text-[#1e1e1e]"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1e1e1e]" />
              <Input
                type="text"
                placeholder="Where?"
                className="w-full pl-12 h-12 rounded-xl focus:border-[#FF6A00] focus:ring-[#FF6A00] bg-[#ECE3DC] shadow-lg text-[#1e1e1e]"
              />
              <X className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1e1e1e] cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex-1 relative">
              <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1e1e1e]" />
              <Input
                type="text"
                placeholder="When ?"
                value={searchTime}
                onClick={() => setIsTimeDialogOpen(true)}
                readOnly
                className="w-full pl-12 h-12 rounded-xl focus:border-[#FF6A00] focus:ring-[#FF6A00] bg-[#ECE3DC] shadow-lg text-[#1e1e1e] cursor-pointer"
              />
              {searchTime && (
                <X
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1e1e1e] cursor-pointer hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTime("");
                    setSelectedDate(undefined);
                    setSelectedTimeSlot("Anytime");
                  }}
                />
              )}
            </div>

            {/* Filter Icons */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl bg-[#ECE3DC] hover:bg-[#D4C4B4] text-[#1e1e1e] shadow-lg flex-shrink-0"
            >
              <Filter className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl bg-[#ECE3DC] hover:bg-[#D4C4B4] text-[#1e1e1e] shadow-lg flex-shrink-0"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Category Circles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-4 mb-8 overflow-x-auto pb-2 px-2 scrollbar-hide"
        >
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 transition-all pt-4 ${
                selectedCategory === category.id ? "scale-110" : ""
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                  selectedCategory === category.id
                    ? "bg-[#FF6A00] shadow-lg"
                    : "bg-[#ECE3DC] shadow-md"
                }`}
              >
                {category.icon}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {category.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Offers Carousel */}
        {offers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 flex flex-col items-center"
          >
            <div className="w-full max-w-2xl">
              <Card className="relative overflow-hidden rounded-3xl bg-[#ECE3DC] hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden">
                    {offers[currentOfferIndex].image ? (
                      <img
                        src={offers[currentOfferIndex].image}
                        alt={offers[currentOfferIndex].title}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F44A01] to-[#FF6A00] flex items-center justify-center">
                        <Tag className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <Badge className="absolute top-4 right-4 bg-[#FF6A00] text-white border-0 font-bold text-base px-4 py-2 rounded-full">
                      {offers[currentOfferIndex].discountType === "percentage"
                        ? `Get ${offers[currentOfferIndex].discountValue}% off`
                        : `Get £${offers[currentOfferIndex].discountValue} off`}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Carousel Indicators */}
              {offers.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {offers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentOfferIndex(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentOfferIndex
                          ? "w-8 bg-[#FF6A00]"
                          : "w-2 bg-gray-300"
                      }`}
                      aria-label={`Go to offer ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recommended Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recommended</h3>
            <Button
              variant="ghost"
              className="text-[#000000] hover:text-orange-600 hover:bg-orange-50 font-medium"
            >
              <p className="text-[#000000]"> View All </p>
              <ArrowRight />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#ECE3DC] rounded-2xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedSalons.map((salon, index) => {
                const salonOffers = getSalonOffers(salon.id);
                const hasOffers = salonOffers.length > 0;

                return (
                  <motion.div
                    key={salon.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="group"
                  >
                    <Card
                      className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col cursor-pointer"
                      onClick={() => handleSalonClick(salon.id)}
                    >
                      <div className="relative aspect-video overflow-hidden bg-transparent p-4">
                        <img
                          src={getSalonImage(salon)}
                          alt={salon.name}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                        />
                        {hasOffers && (
                          <div className="absolute top-6 right-6 z-10">
                            <Badge className="bg-gradient-to-r from-[#F44A01] to-[#FF6A00] text-white border-0 text-xs font-semibold shadow-md">
                              <Tag className="w-3 h-3 mr-1" />
                              {salonOffers.length}{" "}
                              {salonOffers.length === 1 ? "Offer" : "Offers"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 flex flex-col grow">
                        <CardTitle className="text-base font-semibold text-[#1E1E1E] leading-tight line-clamp-2 mb-2">
                          {salon.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm font-medium text-[#1E1E1E]">
                            {salonRatings[salon.id]?.rating.toFixed(1) || "0.0"}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i <
                                  Math.floor(
                                    salonRatings[salon.id]?.rating || 0,
                                  )
                                    ? "fill-[#F44A01] text-[#F44A01]"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-[#616161]">
                            ({salonRatings[salon.id]?.count || 0})
                          </span>
                        </div>
                        <p className="text-sm text-[#1E1E1E] mb-2 line-clamp-2">
                          {salon.address}
                        </p>
                        <p className="text-xs text-[#616161] mb-2">
                          {getSalonType(salon)}
                        </p>
                      </CardContent>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookAppointment(salon.id);
                        }}
                        className="w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 bg-[#1E1E1E] hover:bg-[#2a2a2a] text-[#ECE3DC] font-medium text-xs p-7"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Book Appointment
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Special Offers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Special offers</h3>
            <Button
              variant="ghost"
              className="text-[#000000] hover:text-orange-600 hover:bg-orange-50 font-medium"
            >
              <p className="text-[#000000]"> View All </p>
              <ArrowRight />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#ECE3DC] rounded-2xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specialOfferSalons.map((salon, index) => {
                const salonOffers = getSalonOffers(salon.id);
                const hasOffers = salonOffers.length > 0;

                return (
                  <motion.div
                    key={salon.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="group"
                  >
                    <Card
                      className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col cursor-pointer"
                      onClick={() => handleSalonClick(salon.id)}
                    >
                      <div className="relative aspect-video overflow-hidden bg-transparent p-4">
                        <img
                          src={getSalonImage(salon)}
                          alt={salon.name}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                        />
                        {hasOffers && (
                          <div className="absolute top-6 left-6 z-10">
                            <Badge className="bg-gradient-to-r from-[#F44A01] to-[#FF6A00] text-white border-0 text-xs font-semibold shadow-md">
                              <Tag className="w-3 h-3 mr-1" />
                              {salonOffers.length}{" "}
                              {salonOffers.length === 1 ? "Offer" : "Offers"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 flex flex-col grow">
                        <CardTitle className="text-base font-semibold text-[#1E1E1E] leading-tight line-clamp-2 mb-2">
                          {salon.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm font-medium text-[#1E1E1E]">
                            {salonRatings[salon.id]?.rating.toFixed(1) || "0.0"}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i <
                                  Math.floor(
                                    salonRatings[salon.id]?.rating || 0,
                                  )
                                    ? "fill-[#F44A01] text-[#F44A01]"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-[#616161]">
                            ({salonRatings[salon.id]?.count || 0})
                          </span>
                        </div>
                        <p className="text-sm text-[#1E1E1E] mb-2 line-clamp-2">
                          {salon.address}
                        </p>
                        <p className="text-xs text-[#616161] mb-2">
                          {getSalonType(salon)}
                        </p>
                      </CardContent>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookAppointment(salon.id);
                        }}
                        className="w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 bg-[#1E1E1E] hover:bg-[#2a2a2a] text-[#ECE3DC] font-medium text-xs p-7"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Book Appointment
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />

      {/* Time Picker Dialog */}
      <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
        <DialogContent className="max-w-[320px] bg-white p-0 gap-0">
          <DialogHeader className="px-4 pt-5 pb-3">
            <DialogTitle className="text-base font-semibold text-center">
              Preferred time
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 px-4 pb-5">
            {/* Calendar */}
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 p-0"
                classNames={{
                  months: "flex flex-col space-y-2",
                  month: "space-y-2",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-xs font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                  table: "w-full border-collapse space-y-0.5",
                  head_row: "flex justify-between",
                  head_cell:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
                  row: "flex w-full mt-1 justify-between",
                  cell: "h-8 w-8 text-center text-xs p-0 relative",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                  day_selected:
                    "bg-[#0E7490] text-primary-foreground hover:bg-[#0E7490] hover:text-primary-foreground focus:bg-[#0E7490] focus:text-primary-foreground rounded-md",
                  day_today: "bg-accent text-accent-foreground rounded-md",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </div>

            {/* Time Slots */}
            <div className="flex gap-1.5 justify-between">
              {["Morning", "Afternoon", "Evening", "Anytime"].map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTimeSlot === slot ? "default" : "outline"}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`rounded-md px-2 py-1.5 text-xs flex-1 ${
                    selectedTimeSlot === slot
                      ? "bg-[#B8E6F0] text-[#1E1E1E] hover:bg-[#A0D8E8] border-0 hover:text-[#1e1e1e]"
                      : "bg-white text-[#1E1E1E] border-gray-300 hover:bg-gray-50 hover:text-[#1e1e1e]"
                  }`}
                >
                  {slot}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(undefined);
                  setSelectedTimeSlot("Anytime");
                  setSearchTime("");
                }}
                className="flex-1 rounded-md border-gray-300 text-[#1E1E1E] hover:bg-gray-50 h-9 text-sm hover:text-[#1e1e1e]"
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  const dateStr = selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "";
                  setSearchTime(
                    dateStr && selectedTimeSlot !== "Anytime"
                      ? `${dateStr}, ${selectedTimeSlot}`
                      : dateStr || selectedTimeSlot,
                  );
                  setIsTimeDialogOpen(false);
                }}
                className="flex-1 rounded-md bg-[#0E7490] hover:bg-[#0C6684] text-white h-9 text-sm"
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
