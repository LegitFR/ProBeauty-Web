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
            <section className="bg-gradient-to-r from-[#F44A01] to-[#FF6A00] text-white py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                    <Gift className="w-12 h-12" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
                    Special Offers & Deals
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-['Poppins']">
                    Discover amazing discounts on your favorite beauty products
                    and services
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Badge className="bg-white text-[#F44A01] text-sm px-4 py-2 font-semibold">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {offers.length} Active Offers
                    </Badge>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Search and Filters */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
              <Card className="border-4 border-[#1E1E1E] shadow-2xl bg-[#ECE3DC]">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#616161]" />
                      <Input
                        type="text"
                        placeholder="Search offers by title, salon, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white border-2 border-[#1E1E1E] rounded-xl text-[#1E1E1E] placeholder:text-[#616161] focus:border-[#F44A01] focus:ring-2 focus:ring-[#F44A01]"
                      />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#616161]" />
                        <span className="text-sm font-medium text-[#1E1E1E] font-['Poppins']">
                          Filter by:
                        </span>
                      </div>

                      {/* Offer Type Filter */}
                      <div className="flex gap-2">
                        {[
                          { value: "all", label: "All Offers", icon: Tag },
                          {
                            value: "salon",
                            label: "Salon Wide",
                            icon: Sparkles,
                          },
                          { value: "product", label: "Products", icon: Gift },
                          {
                            value: "service",
                            label: "Services",
                            icon: Sparkles,
                          },
                        ].map(({ value, label, icon: Icon }) => (
                          <Button
                            key={value}
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
                                ? "bg-[#F44A01] hover:bg-[#FF6A00] text-white border-0"
                                : "border-2 border-[#1E1E1E] hover:bg-[#CBCBCB] text-[#1E1E1E]"
                            }
                          >
                            <Icon className="w-3.5 h-3.5 mr-1.5" />
                            {label}
                          </Button>
                        ))}
                      </div>

                      {/* Discount Type Filter */}
                      <div className="flex gap-2">
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
                          <Button
                            key={value}
                            variant={
                              filterDiscount === value ? "default" : "outline"
                            }
                            onClick={() =>
                              setFilterDiscount(
                                value as "all" | "percentage" | "flat",
                              )
                            }
                            size="sm"
                            className={
                              filterDiscount === value
                                ? "bg-[#1E1E1E] hover:bg-[#2a2a2a] text-white border-0"
                                : "border-2 border-[#1E1E1E] hover:bg-[#CBCBCB] text-[#1E1E1E]"
                            }
                          >
                            <Icon className="w-3.5 h-3.5 mr-1.5" />
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-[#616161] font-['Poppins']">
                      Showing {filteredOffers.length} of {offers.length} offers
                    </div>
                  </div>
                </CardContent>
              </Card>
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
