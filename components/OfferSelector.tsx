"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Gift,
  X,
  Search,
} from "lucide-react";
import { useOffers } from "@/lib/hooks/useOffers";
import { validateOffer } from "@/lib/api/offer";
import { OfferCard } from "./OfferCard";
import type { Offer } from "@/lib/types/offer";
import { toast } from "sonner";

interface CartItem {
  id: string | number;
  salonId?: string;
  serviceId?: string; // For service bookings
}

interface OfferSelectorProps {
  cartItems: CartItem[];
  amount: number;
  onOffersApplied: (offers: Array<{ offer: Offer; discount: number }>) => void;
  selectedOffers?: Array<{ offer: Offer; discount: number }>;
  className?: string;
}

export function OfferSelector({
  cartItems,
  amount,
  onOffersApplied,
  selectedOffers = [],
  className = "",
}: OfferSelectorProps) {
  const [showOffers, setShowOffers] = useState(false);
  const [offerCode, setOfferCode] = useState("");
  const [validatingOfferId, setValidatingOfferId] = useState<string | null>(
    null,
  );

  // Get all active offers and filter them based on cart items
  const { offers: allOffers, loading, error } = useOffers();

  // Extract unique salonIds and productIds from cart
  const cartSalonIds = [
    ...new Set(cartItems.map((item) => item.salonId).filter(Boolean)),
  ];
  const cartProductIds = cartItems.map((item) => item.id);
  const cartServiceIds = cartItems
    .map((item) => item.serviceId)
    .filter(Boolean) as string[];

  // Filter offers to only show relevant ones
  const offers = allOffers.filter((offer) => {
    // Salon-wide offers: must match one of the salons in cart
    if (offer.offerType === "salon") {
      return cartSalonIds.includes(offer.salonId);
    }
    // Product offers: must match one of the products in cart
    if (offer.offerType === "product" && offer.productId) {
      return cartProductIds.includes(offer.productId);
    }
    // Service offers: must match one of the services in cart
    if (offer.offerType === "service" && offer.serviceId) {
      return cartServiceIds.includes(offer.serviceId);
    }
    return false;
  });

  const handleToggleOffer = async (offer: Offer) => {
    // Check if offer is already selected
    const isSelected = selectedOffers.some((so) => so.offer.id === offer.id);

    if (isSelected) {
      // Remove offer
      const updatedOffers = selectedOffers.filter(
        (so) => so.offer.id !== offer.id,
      );
      onOffersApplied(updatedOffers);
      return;
    }

    // Add offer - validate it first
    setValidatingOfferId(offer.id);

    // Determine which product/salon/service to validate against based on offer type
    let validationSalonId = offer.salonId;
    let validationProductId = offer.productId || undefined;
    let validationServiceId = offer.serviceId || undefined;

    // If it's a product offer, ensure we're validating against that specific product
    if (offer.offerType === "product" && offer.productId) {
      const cartItem = cartItems.find((item) => item.id === offer.productId);
      validationSalonId = cartItem?.salonId || offer.salonId;
      validationProductId = offer.productId;
    } else if (offer.offerType === "service" && offer.serviceId) {
      // For service offers, use the specific service
      const cartItem = cartItems.find(
        (item) => item.serviceId === offer.serviceId,
      );
      validationSalonId = cartItem?.salonId || offer.salonId;
      validationServiceId = offer.serviceId;
    } else if (offer.offerType === "salon") {
      // For salon offers, use any product from that salon
      const salonItem = cartItems.find(
        (item) => item.salonId === offer.salonId,
      );
      validationProductId = salonItem?.id?.toString();
    }

    try {
      const response = await validateOffer({
        offerId: offer.id,
        amount: amount.toString(),
        salonId: validationSalonId,
        productId: validationProductId,
        serviceId: validationServiceId,
      });

      if (response?.data?.valid && response.data.discountAmount > 0) {
        // Add the offer to selected offers
        const updatedOffers = [
          ...selectedOffers,
          { offer, discount: response.data.discountAmount },
        ];
        onOffersApplied(updatedOffers);
      } else if (response?.error) {
        console.warn("Offer validation failed:", response.error);
        toast.error(
          response.error || "This offer cannot be applied to your cart",
        );
      } else {
        toast.warning("This offer is not valid for your current selection");
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate offer. Please try again.");
    } finally {
      setValidatingOfferId(null);
    }
  };

  const handleRemoveAllOffers = () => {
    setOfferCode("");
    onOffersApplied([]);
  };

  return (
    <div className={className}>
      {/* Only show if there are relevant offers */}
      {(loading || offers.length > 0) && (
        <Card className="border-2 border-[#1E1E1E] bg-[#ECE3DC] overflow-hidden">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="flex items-center justify-between font-['Poppins'] text-base">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#F44A01]" />
                <span className="text-[#1E1E1E]">Available Offers</span>
              </div>
              {offers.length > 0 && selectedOffers.length === 0 && (
                <Badge
                  variant="outline"
                  className="bg-[#F44A01] text-white border-0 text-xs"
                >
                  {offers.length} offer{offers.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Applied Offers Display */}
            {selectedOffers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#1E1E1E] font-['Poppins']">
                    Applied Offers ({selectedOffers.length})
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAllOffers}
                    className="text-xs text-[#F44A01] hover:text-orange-700 hover:bg-orange-50 h-7"
                  >
                    Remove All
                  </Button>
                </div>
                {selectedOffers.map(({ offer, discount }) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <div className="bg-green-500 rounded-full p-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 text-xs font-['Poppins']">
                            {offer.title}
                          </p>
                          <p className="text-green-700 text-xs mt-0.5 font-['Poppins']">
                            Saved £{discount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleOffer(offer)}
                        className="h-6 w-6 p-0 hover:bg-green-100 text-green-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Browse Offers Button */}
            {offers.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowOffers(!showOffers)}
                className="w-full border-2 border-[#1E1E1E] bg-white hover:bg-[#F5F5F5] hover:text-[#1E1E1E] text-[#1E1E1E] font-semibold rounded-lg h-11"
              >
                <Tag className="w-4 h-4 mr-2" />
                {showOffers ? "Hide Offers" : "Browse Available Offers"}
              </Button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#F44A01]" />
              </div>
            )}

            {/* Offers List */}
            <AnimatePresence>
              {showOffers && !loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#F44A01] scrollbar-track-[#ECE3DC]"
                >
                  {offers.map((offer) => (
                    <div key={offer.id} className="relative">
                      <OfferCard
                        offer={offer}
                        onSelect={() => handleToggleOffer(offer)}
                        isSelected={selectedOffers.some(
                          (so) => so.offer.id === offer.id,
                        )}
                        showDetails={false}
                      />
                      {validatingOfferId === offer.id && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                          <Loader2 className="w-6 h-6 text-[#F44A01] animate-spin" />
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Offers Message */}
            {!loading && offers.length === 0 && (
              <div className="text-center py-6">
                <Gift className="w-12 h-12 text-[#CBCBCB] mx-auto mb-2" />
                <p className="text-sm text-[#616161] font-['Poppins']">
                  No offers available at the moment
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-center py-4">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 font-['Poppins']">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
