"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { navigateWithTranslate } from "@/lib/utils/translateNavigation";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  Search,
  Heart,
  Sparkles,
  Filter,
  Funnel,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { getSalons, type Salon } from "@/lib/api/salon";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { useWishlist } from "./WishlistContext";

interface SalonBookingProps {
  onBookAppointment?: (salon: Salon) => void;
}

export function SalonBooking({ onBookAppointment }: SalonBookingProps) {
  const router = useRouter();
  const language = useLanguage();
  const { isSalonInWishlist, addSalonToWishlist, removeSalonFromWishlist } = useWishlist();

  const text =
      language === "pt"
        ? {
            removedFromFavorites: "Removido dos favoritos",
            addedToFavorites: "Adicionado aos favoritos",
            services: [
              { id: "haircut", name: "Corte e penteado", icon: "✂️" },
              { id: "facial", name: "Tratamento facial e pele", icon: "✨" },
              { id: "massage", name: "Massagem terapêutica", icon: "💆" },
              { id: "nails", name: "Manicure e pedicure", icon: "💅" },
              { id: "bridal", name: "Pacote para noivas", icon: "👰" },
              { id: "makeup", name: "Maquilhagem profissional", icon: "💄" },
            ],
            titleLead: "Reserve já a sua",
            titleHighlight: "experiência de beleza perfeita",
            subtitle:
              "Descubra salões de beleza premium, faça a sua reserva instantaneamente e desfrute de serviços de beleza personalizados com o nosso sistema de recomendação baseado em inteligência artificial",
            searchPlaceholder: "Procure localização ou salão...",
            servicePlaceholder: "Selecione serviço",
            aiToast: "A IA está a encontrar os salões perfeitos para si...",
            aiSearch: "Procura com AI",
            viewAll: "Ver tudo",
            bookCta: "Agendar reserva",
          }
      : {
          removedFromFavorites: "Removed from favorites",
          addedToFavorites: "Added to favorites",
          services: [
            { id: "haircut", name: "Hair Cut & Style", icon: "✂️" },
            { id: "facial", name: "Facial & Skincare", icon: "✨" },
            { id: "massage", name: "Massage Therapy", icon: "💆" },
            { id: "nails", name: "Manicure & Pedicure", icon: "💅" },
            { id: "bridal", name: "Bridal Package", icon: "👰" },
            { id: "makeup", name: "Professional Makeup", icon: "💄" },
          ],
          titleLead: "Book Your Perfect",
          titleHighlight: "Beauty Experience",
          subtitle:
            "Discover premium salons, book instantly, and enjoy personalized beauty services with our AI-powered recommendation system",
          searchPlaceholder: "Search location or salon...",
          servicePlaceholder: "Select service",
          aiToast: "AI is finding the perfect salons for you...",
          aiSearch: "AI Search",
          viewAll: "View All",
          bookCta: "Book Appointment",
        };

  const handleTranslatedNavigation = (href: string) => {
    navigateWithTranslate(router, href);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalons();
  }, []);

  const loadSalons = async () => {
    try {
      const response = await getSalons({
        page: 1,
        limit: 3,
        verified: true,
      });
      setSalons(response.data);
    } catch (error) {
      console.error("Failed to load salons:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (salon: Salon) => {
    const isFavorite = isSalonInWishlist(salon.id);
    if (isFavorite) {
      removeSalonFromWishlist(salon.id);
    } else {
      addSalonToWishlist({
        id: salon.id,
        name: salon.name,
        address: salon.address,
        image: salon.thumbnail || (salon.images && salon.images[0]) || "",
        verified: salon.verified || false,
      });
    }
  };

  const services = text.services;

  const filteredSalons = salons.filter((salon) => {
    const searchMatch =
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  return (
    <section id="book" className="py-24 bg-[#ECE3DC]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-black mb-10">
            {text.titleLead}{" "}
            <span className="bg-gradient-to-r text-primary bg-clip-text bg-[length:400%_400%]">
              {text.titleHighlight}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {text.subtitle}
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#ECE3DC] backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 mb-12 sm:mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-stretch">
            <div className="relative group flex">
              <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#000000] group-focus-within:text-[#FF7A00] transition-colors z-10" />
              <Input
                type="text"
                placeholder={text.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[#616161] border-2 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all bg-transparent text-sm sm:text-base placeholder:text-[#1e1e1e]"
              />
            </div>

            <div className="flex">
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[#616161] border-2 bg-transparent text-sm sm:text-base">
                  <Filter className="h-4 w-4 mr-2 text-[#1e1e1e]" />
                  <SelectValue
                    placeholder={text.servicePlaceholder}
                    className="placeholder:text[#1e1e1e]"
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <span className="mr-2">{service.icon}</span>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => toast.success(text.aiToast)}
              className="h-12 sm:h-14 bg-gradient-to-r from-[#FF7A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group w-full text-sm sm:text-base"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
              {text.aiSearch}
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* View All Button */}
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            onClick={() => handleTranslatedNavigation("/salons")}
            className="text-black hover:text-orange-600 hover:bg-orange-50 font-medium"
          >
            <p className="text-[#000000]">{text.viewAll}</p>
            <ArrowRight />
          </Button>
        </div>

        {/* Salon Grid - Responsive layout */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gray-300 m-4 rounded-lg"></div>
                  <CardContent className="p-3">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </CardContent>
                  <div className="h-16 bg-gray-300"></div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-4">
            {filteredSalons.slice(0, 3).map((salon, index) => {
              const isFavorite = isSalonInWishlist(salon.id);
              
              return (
                <motion.div
                  key={salon.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  className="group h-full rounded-3xl"
                >
                  <Card className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col">
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

                      {/* Wishlist Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite(salon)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10 border border-gray-200"
                      >
                        <Heart
                          className={`h-3 w-3 transition-colors ${
                            isFavorite
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      </motion.button>
                    </div>

                    <CardContent className="p-3 flex flex-col grow">
                      <CardTitle className="text-base font-semibold text-[#1E1E1E] leading-tight line-clamp-2 mb-2">
                        {salon.name}
                      </CardTitle>

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

                      <CardDescription className="text-sm text-[#1E1E1E] mb-2">
                        {salon.address}
                      </CardDescription>

                      <p className="text-xs text-[#616161] mb-2">
                        {salon.verified ? "verified salon" : "beauty salon"}
                      </p>
                    </CardContent>

                    <Button
                      onClick={() => onBookAppointment?.(salon)}
                      className="w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 bg-[#1E1E1E] hover:bg-[#2a2a2a] text-[#ECE3DC] font-medium text-xs p-7"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {text.bookCta}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
