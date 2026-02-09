"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { Toaster } from "@/components/Toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useOffers } from "@/lib/hooks/useOffers";
import { OfferCard } from "@/components/OfferCard";
import {
  Gift,
  Search,
  Loader2,
  Sparkles,
  Tag,
  Percent,
  TrendingDown,
  Filter,
} from "lucide-react";

export default function OffersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "salon" | "product" | "service"
  >("all");
  const [filterDiscount, setFilterDiscount] = useState<
    "all" | "percentage" | "flat"
  >("all");

  const { offers, loading, error } = useOffers();

  // Filter offers based on search and filters
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.salon?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || offer.offerType === filterType;
    const matchesDiscount =
      filterDiscount === "all" || offer.discountType === filterDiscount;

    return matchesSearch && matchesType && matchesDiscount;
  });

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-[#ECE3DC] text-[#1E1E1E]">
          <Header />

          <main className="pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#F44A01] via-[#FF6A00] to-[#FF8C42] text-white py-20 px-4">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div
                  className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
              </div>

              {/* Decorative Sparkles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                      scale: 0,
                      rotate: 0,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: 360,
                      y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                    style={{
                      left: `${(i * 8.33) % 100}%`,
                      top: `${(i * 13) % 100}%`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white/40" />
                  </motion.div>
                ))}
              </div>

              {/* Floating Gift Icons */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`gift-${i}`}
                  className="absolute opacity-5"
                  initial={{
                    x: `${20 + i * 15}%`,
                    y: "100%",
                    rotate: 0,
                  }}
                  animate={{
                    y: ["-20%", "100%"],
                    rotate: [0, 360],
                    x: `${20 + i * 15 + Math.sin(i) * 10}%`,
                  }}
                  transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 2,
                  }}
                >
                  <Gift className="w-16 h-16" />
                </motion.div>
              ))}

              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  {/* Icon with Glow Effect */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                    className="inline-block relative mb-6"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150"></div>
                    <div className="relative p-5 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 shadow-2xl">
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Gift className="w-14 h-14" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Title with Gradient Text */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-5xl md:text-7xl font-bold mb-6 font-['Poppins'] leading-tight"
                  >
                    <span className="inline-block">Special Offers</span>
                    <br />
                    <span className="inline-block bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                      & Deals
                    </span>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg md:text-2xl text-white/95 max-w-3xl mx-auto font-['Poppins'] mb-8 leading-relaxed"
                  >
                    Discover{" "}
                    <span className="font-bold text-yellow-100">
                      exclusive discounts
                    </span>{" "}
                    on premium beauty products and services
                  </motion.p>

                  {/* Badges */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap items-center justify-center gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="bg-[#ECE3DC] text-[#F44A01] px-6 py-3 rounded-full font-bold text-lg shadow-xl border-2 border-white/20 backdrop-blur-sm flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      <span>{offers.length} Hot Deals</span>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full font-semibold text-lg border-2 border-white/30 flex items-center gap-2 shadow-xl"
                    >
                      <Percent className="w-5 h-5" />
                      <span>Save up to 70%</span>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="bg-[#1E1E1E] text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl flex items-center gap-2 border-2 border-white/20"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        <Tag className="w-5 h-5" />
                      </motion.div>
                      <span>Limited Time</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Bottom Wave Divider */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg
                  viewBox="0 0 1440 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
                    fill="#ECE3DC"
                  />
                </svg>
              </div>
            </section>

            {/* Search and Filters */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#ECE3DC]">
                  {/* Decorative gradient top border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F44A01] via-[#FF6A00] to-[#FF8C42]"></div>

                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F44A01] to-[#FF6A00] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#FF8C42] to-[#F44A01] rounded-full blur-3xl"></div>
                  </div>

                  <CardContent className="p-8 relative z-10">
                    <div className="space-y-6">
                      {/* Search Bar */}
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F44A01] to-[#FF6A00] rounded-2xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative">
                          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#F44A01] z-10" />
                          <Input
                            type="text"
                            placeholder="Search offers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-with-icon pr-6 h-16 bg-[#ECE3DC] border-2 border-[#E5E5E5] rounded-2xl text-[#1E1E1E] placeholder:text-[#616161] font-['Poppins'] text-base
                                     hover:border-[#F44A01]/50 focus:border-[#F44A01] focus:ring-4 focus:ring-[#F44A01]/20 transition-all duration-300
                                     shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>

                      {/* Filter Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-[#F44A01] to-[#FF6A00] rounded-lg shadow-md">
                            <Filter className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-base font-semibold text-[#1E1E1E] font-['Poppins']">
                            Filter by
                          </span>
                          <div className="flex-1 h-px bg-gradient-to-r from-[#E5E5E5] to-transparent"></div>
                        </div>

                        {/* Filter Buttons Container */}
                        <div className="flex flex-wrap gap-3">
                          {/* Offer Type Filter */}
                          <div className="flex flex-wrap gap-2">
                            {[
                              { value: "all", label: "All Offers", icon: Tag },
                              {
                                value: "salon",
                                label: "Salon Wide",
                                icon: Sparkles,
                              },
                              {
                                value: "product",
                                label: "Products",
                                icon: Gift,
                              },
                              {
                                value: "service",
                                label: "Services",
                                icon: Sparkles,
                              },
                            ].map(({ value, label, icon: Icon }) => (
                              <motion.div
                                key={value}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant={
                                    filterType === value ? "default" : "outline"
                                  }
                                  onClick={() =>
                                    setFilterType(
                                      value as
                                        | "all"
                                        | "salon"
                                        | "product"
                                        | "service",
                                    )
                                  }
                                  size="sm"
                                  className={
                                    filterType === value
                                      ? "bg-gradient-to-r from-[#F44A01] to-[#FF6A00] hover:from-[#FF6A00] hover:to-[#FF8C42] text-white border-0 shadow-lg shadow-[#F44A01]/30 font-semibold h-10 px-5"
                                      : "border-2 border-[#1E1E1E] hover:border-[#F44A01] hover:bg-[#D5CCC4] text-[#1E1E1E] bg-[#ECE3DC] font-medium h-10 px-5 transition-all duration-200"
                                  }
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  {label}
                                </Button>
                              </motion.div>
                            ))}
                          </div>

                          {/* Divider */}
                          <div className="w-px h-10 bg-[#E5E5E5] mx-2"></div>

                          {/* Discount Type Filter */}
                          <div className="flex flex-wrap gap-2">
                            {[
                              { value: "all", label: "All Types", icon: Tag },
                              {
                                value: "percentage",
                                label: "% Off",
                                icon: Percent,
                              },
                              {
                                value: "flat",
                                label: "£ Off",
                                icon: TrendingDown,
                              },
                            ].map(({ value, label, icon: Icon }) => (
                              <motion.div
                                key={value}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant={
                                    filterDiscount === value
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    setFilterDiscount(
                                      value as "all" | "percentage" | "flat",
                                    )
                                  }
                                  size="sm"
                                  className={
                                    filterDiscount === value
                                      ? "bg-[#1E1E1E] hover:bg-[#2a2a2a] text-white border-0 shadow-lg shadow-[#1E1E1E]/20 font-semibold h-10 px-5"
                                      : "border-2 border-[#1E1E1E] hover:border-[#1E1E1E] hover:bg-[#D5CCC4] text-[#1E1E1E] bg-[#ECE3DC] font-medium h-10 px-5 transition-all duration-200"
                                  }
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  {label}
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Results Count */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2 pt-2"
                      >
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F44A01]/10 to-[#FF6A00]/10 rounded-full border border-[#F44A01]/20">
                          <div className="w-2 h-2 bg-[#F44A01] rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-[#1E1E1E] font-['Poppins']">
                            Showing {filteredOffers.length} of {offers.length}{" "}
                            offers
                          </span>
                        </div>
                        {filteredOffers.length < offers.length && (
                          <span className="text-xs text-[#9CA3AF] font-['Poppins']">
                            (filters applied)
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Offers Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#F44A01] mx-auto mb-4" />
                    <p className="text-[#616161] font-['Poppins']">
                      Loading offers...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <Card className="p-12 text-center bg-[#ECE3DC] border-4 border-red-500">
                  <CardContent>
                    <div className="text-red-500 mb-4">
                      <Gift className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-semibold text-[#1E1E1E] mb-2 font-['Poppins']">
                      Failed to Load Offers
                    </h3>
                    <p className="text-[#616161] font-['Poppins']">{error}</p>
                  </CardContent>
                </Card>
              ) : filteredOffers.length === 0 ? (
                <Card className="p-12 text-center bg-[#ECE3DC] border-4 border-[#1E1E1E]">
                  <CardContent>
                    <div className="text-[#616161] mb-4">
                      <Search className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-semibold text-[#1E1E1E] mb-2 font-['Poppins']">
                      No Offers Found
                    </h3>
                    <p className="text-[#616161] font-['Poppins']">
                      Try adjusting your filters or search query
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterType("all");
                        setFilterDiscount("all");
                      }}
                      className="mt-4 bg-[#F44A01] hover:bg-[#FF6A00] text-white font-['Poppins']"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOffers.map((offer, index) => (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <OfferCard offer={offer} showDetails />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </main>

          <Footer />
          <Toaster />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
