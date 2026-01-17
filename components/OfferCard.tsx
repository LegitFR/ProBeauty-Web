"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Tag,
  Calendar,
  Percent,
  TrendingDown,
  Gift,
  Sparkles,
} from "lucide-react";
import type { Offer } from "@/lib/types/offer";
import { isOfferValid } from "@/lib/api/offer";

interface OfferCardProps {
  offer: Offer;
  onSelect?: (offer: Offer) => void;
  isSelected?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function OfferCard({
  offer,
  onSelect,
  isSelected = false,
  showDetails = false,
  className = "",
}: OfferCardProps) {
  const valid = isOfferValid(offer);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const displayValue =
    offer.discountType === "percentage"
      ? `${offer.discountValue}% OFF`
      : `£${offer.discountValue} OFF`;

  const Icon = offer.discountType === "percentage" ? Percent : TrendingDown;

  const getOfferScope = () => {
    if (offer.offerType === "salon") return "All Products & Services";
    if (offer.offerType === "product" && offer.product)
      return offer.product.title;
    if (offer.offerType === "service" && offer.service)
      return offer.service.title;
    return "Select Items";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card
        className={`
          relative overflow-hidden border-2 transition-all duration-300
          ${
            isSelected
              ? "border-[#F44A01] shadow-lg bg-gradient-to-br from-[#FFF5F0] to-[#ECE3DC]"
              : "border-[#1E1E1E] hover:border-[#F44A01] bg-[#ECE3DC]"
          }
          ${!valid ? "opacity-60" : ""}
          ${onSelect ? "cursor-pointer" : ""}
        `}
        onClick={() => onSelect && valid && onSelect(offer)}
      >
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#F44A01] to-[#FF6A00] opacity-10 rounded-bl-full" />

        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Offer Image or Icon */}
            <div className="flex-shrink-0">
              {offer.image ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-[#1E1E1E] shadow-sm">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-offer.png";
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#F44A01] to-[#FF6A00] flex items-center justify-center border-2 border-[#1E1E1E] shadow-sm">
                  <Gift className="w-10 h-10 text-white" />
                </div>
              )}
            </div>

            {/* Offer Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1E1E1E] text-base leading-tight mb-1 font-['Poppins']">
                    {offer.title}
                  </h3>
                  {offer.salon && (
                    <p className="text-xs text-[#616161] font-['Poppins']">
                      {offer.salon.name}
                    </p>
                  )}
                </div>
                <Badge
                  className={`
                    shrink-0 font-bold text-xs px-2 py-1
                    ${
                      offer.discountType === "percentage"
                        ? "bg-gradient-to-r from-[#F44A01] to-[#FF6A00]"
                        : "bg-gradient-to-r from-[#1E1E1E] to-[#3a3a3a]"
                    }
                    text-white border-0 shadow-md
                  `}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {displayValue}
                </Badge>
              </div>

              {offer.description && (
                <p className="text-sm text-[#616161] mb-3 line-clamp-2 font-['Poppins']">
                  {offer.description}
                </p>
              )}

              {/* Offer Scope */}
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-[#F44A01]" />
                <span className="text-xs text-[#1E1E1E] font-medium font-['Poppins']">
                  {getOfferScope()}
                </span>
              </div>

              {/* Validity Period */}
              {showDetails && (
                <div className="flex items-center gap-2 text-xs text-[#616161] font-['Poppins']">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Valid: {formatDate(offer.startsAt)} -{" "}
                    {formatDate(offer.endsAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2 bg-[#F44A01] text-white rounded-full p-1 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          )}

          {/* Expired Badge */}
          {!valid && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <Badge variant="destructive" className="text-sm font-semibold">
                Expired
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface OfferBannerProps {
  offer: Offer;
  onApply?: (offer: Offer) => void;
  className?: string;
}

export function OfferBanner({
  offer,
  onApply,
  className = "",
}: OfferBannerProps) {
  const valid = isOfferValid(offer);

  if (!valid) return null;

  const displayValue =
    offer.discountType === "percentage"
      ? `${offer.discountValue}% OFF`
      : `£${offer.discountValue} OFF`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        bg-gradient-to-r from-[#F44A01] to-[#FF6A00] 
        text-white p-4 rounded-xl shadow-lg border-2 border-[#1E1E1E]
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg font-['Poppins']">{displayValue}</p>
            <p className="text-sm opacity-90 font-['Poppins']">{offer.title}</p>
          </div>
        </div>
        {onApply && (
          <Button
            onClick={() => onApply(offer)}
            className="bg-white text-[#F44A01] hover:bg-[#ECE3DC] font-semibold rounded-lg px-6 border-2 border-white"
          >
            Apply
          </Button>
        )}
      </div>
    </motion.div>
  );
}
