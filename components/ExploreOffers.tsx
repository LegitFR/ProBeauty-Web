"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useOffers } from "@/lib/hooks/useOffers";
import { OfferCard } from "./OfferCard";
import { useRouter } from "next/navigation";
import { navigateWithTranslate } from "@/lib/utils/translateNavigation";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { Button } from "./ui/button";

export function ExploreOffers() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { offers, loading } = useOffers();
  const router = useRouter();
  const language = useLanguage();

  const content = language === "pt" ? {
    titleStart: "Explore as nossas",
    titleHighlight: "ofertas",
    description: "Descubra descontos exclusivos em produtos e serviços de beleza Premium. Aproveite antes que esgote!",
    viewAll: "Veja todas",
    viewAllOffers: "Veja todas as ofertas"
  } : {
    titleStart: "Explore Our",
    titleHighlight: "Offers",
    description: "Discover exclusive discounts on premium beauty products and services. Grab them before they're gone!",
    viewAll: "View All",
    viewAllOffers: "View All Offers"
  };

  // Get up to 5 real offers to show in the carousel
  const displayOffers = offers.slice(0, 5);

  useEffect(() => {
    if (!scrollRef.current || displayOffers.length === 0 || isHovered) return;

    const intervalId = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScrollLeft = scrollWidth - clientWidth;
        
        // If we are near the end, snap back to the start instantly, else scroll right
        if (Math.ceil(scrollLeft) >= maxScrollLeft - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
        } else {
          scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [displayOffers.length, isHovered]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-explore-section relative">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-explore-loader" />
        </div>
      </section>
    );
  }

  if (displayOffers.length === 0) {
    return null; // Don't show the section if no offers are available
  }

  return (
    <section className="py-20 bg-explore-section overflow-hidden relative">
      {/* Subtle Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-explore-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-explore-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-explore-dark mb-4 font-display">
              {content.titleStart} <span className="text-gradient-explore">{content.titleHighlight}</span>
            </h2>
            <p className="text-explore-gray text-lg font-body mb-8">
              {content.description}
            </p>
          </div>
          <div className="hidden md:flex space-x-3 mt-2">
            <button 
              onClick={scrollLeft}
              className="p-3 rounded-full bg-white border border-explore-btn hover:border-explore-btn-hover hover:text-explore-btn-hover transition-all duration-300 text-explore-dark shadow-sm hover:shadow-md"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={scrollRight}
              className="p-3 rounded-full bg-white border border-explore-btn hover:border-explore-btn-hover hover:text-explore-btn-hover transition-all duration-300 text-explore-dark shadow-sm hover:shadow-md"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <Button
              onClick={() => navigateWithTranslate(router, '/offers')}
              className="ml-4 bg-explore-btn-dark hover:bg-explore-btn-dark-hover text-white font-body rounded-full px-6 h-[50px]"
            >
              {content.viewAll}
            </Button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-8 pt-4 snap-x snap-mandatory scrollbar-hide px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {displayOffers.map((offer) => (
            <div 
              key={offer.id} 
              className="flex-none w-[85vw] md:w-[350px] lg:w-[400px] snap-center"
            >
              <OfferCard 
                offer={offer} 
                showDetails={true} 
                className="h-full"
              />
            </div>
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Button
            onClick={() => navigateWithTranslate(router, '/offers')}
            className="bg-explore-btn-dark hover:bg-explore-btn-dark-hover text-white font-body rounded-full px-8 py-6 w-full max-w-sm"
          >
            {content.viewAllOffers}
          </Button>
        </div>
      </div>
    </section>
  );
}
