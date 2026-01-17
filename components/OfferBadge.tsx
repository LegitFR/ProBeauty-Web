"use client";

import { Badge } from "@/components/ui/badge";
import { Tag, Percent, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import type { Offer } from "@/lib/types/offer";

interface OfferBadgeProps {
  offer: Offer;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function OfferBadge({
  offer,
  className = "",
  showIcon = true,
  size = "md",
}: OfferBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSize = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  const displayValue =
    offer.discountType === "percentage"
      ? `${offer.discountValue}% OFF`
      : `£${offer.discountValue} OFF`;

  const Icon = offer.discountType === "percentage" ? Percent : TrendingDown;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Badge
        className={`
          bg-gradient-to-r from-[#F44A01] to-[#FF6A00] 
          text-white border-0 font-semibold 
          shadow-md hover:shadow-lg
          transition-all duration-300
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {showIcon && <Icon className={iconSize[size]} />}
        {displayValue}
      </Badge>
    </motion.div>
  );
}

interface OfferTimerProps {
  endsAt: string;
  className?: string;
}

export function OfferTimer({ endsAt, className = "" }: OfferTimerProps) {
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return "Ending soon";
  };

  const timeText = getTimeRemaining();

  if (!timeText) return null;

  return (
    <Badge
      variant="outline"
      className={`
        text-[10px] px-2 py-0.5 
        bg-white/90 text-[#1E1E1E] 
        border-[#1E1E1E] font-medium
        ${className}
      `}
    >
      ⏰ {timeText}
    </Badge>
  );
}
