import { useState } from "react";
import { Button } from "./ui/button";
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
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface SalonBookingProps {
  onBookAppointment?: (salonId: number) => void;
}

export function SalonBooking({ onBookAppointment }: SalonBookingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedService, setSelectedService] = useState("");

  const toggleFavorite = (salonId: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(salonId)) {
        newSet.delete(salonId);
        toast.success("Removed from favorites");
      } else {
        newSet.add(salonId);
        toast.success("Added to favorites");
      }
      return newSet;
    });
  };

  const services = [
    { id: "haircut", name: "Hair Cut & Style", icon: "✂️" },
    { id: "facial", name: "Facial & Skincare", icon: "✨" },
    { id: "massage", name: "Massage Therapy", icon: "💆" },
    { id: "nails", name: "Manicure & Pedicure", icon: "💅" },
    { id: "bridal", name: "Bridal Package", icon: "👰" },
    { id: "makeup", name: "Professional Makeup", icon: "💄" },
  ];

  const salons = [
    {
      id: 1,
      name: "Vurve Salon",
      location: "Nungambakkam, Chennai",
      distance: "0.8 km",
      rating: 4.5,
      reviews: 1690,
      image:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWF1dHklMjBzYWxvbiUyMGludGVyaW9yfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080",
      services: ["Hair Styling", "Color Treatment", "Keratin"],
      priceRange: "₹800 - ₹3500",
      badge: "beauty salon",
      nextAvailable: "Today 3:00 PM",
      stylist: "Deepika Nair",
      specialOffer: "20% off on first visit",
    },
    {
      id: 2,
      name: "Glam Studio Pro",
      location: "T. Nagar, Chennai",
      distance: "1.2 km",
      rating: 4.8,
      reviews: 892,
      image:
        "https://images.unsplash.com/photo-1633681926035-ec90e342ced9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWF1dHklMjBzYWxvbiUyMGludGVyaW9yfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080",
      services: ["Bridal Makeup", "Party Look", "Pre-Wedding"],
      priceRange: "₹1200 - ₹5000",
      badge: "makeup specialist",
      nextAvailable: "Tomorrow 11:00 AM",
      stylist: "Priya Krishnan",
      specialOffer: "Free consultation",
    },
    {
      id: 3,
      name: "Zen Wellness Spa",
      location: "Adyar, Chennai",
      distance: "2.1 km",
      rating: 4.7,
      reviews: 1245,
      image:
        "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxzcGElMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
      services: ["Swedish Massage", "Aromatherapy", "Body Scrub"],
      priceRange: "₹1500 - ₹4000",
      badge: "wellness center",
      nextAvailable: "Today 5:30 PM",
      stylist: "Kavitha Menon",
      specialOffer: "Couple package available",
    },
    {
      id: 4,
      name: "Quick Style Express",
      location: "Velachery, Chennai",
      distance: "3.5 km",
      rating: 4.3,
      reviews: 567,
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxzYWxvbiUyMGNoYWlyfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080",
      services: ["Basic Haircut", "Beard Trim", "Quick Styling"],
      priceRange: "₹200 - ₹800",
      badge: "express service",
      nextAvailable: "Today 2:00 PM",
      stylist: "Ravi Kumar",
      specialOffer: "15 min express service",
    },
    {
      id: 5,
      name: "Elite Beauty Lounge",
      location: "Anna Nagar, Chennai",
      distance: "4.2 km",
      rating: 4.9,
      reviews: 2134,
      image:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYWxvbnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
      services: ["Hair Transformation", "Color Correction", "Extensions"],
      priceRange: "₹2000 - ₹8000",
      badge: "celebrity stylist",
      nextAvailable: "Tomorrow 2:30 PM",
      stylist: "Meera Iyer",
      specialOffer: "Celebrity makeover package",
    },
    {
      id: 6,
      name: "Glow Aesthetics",
      location: "Besant Nagar, Chennai",
      distance: "5.1 km",
      rating: 4.6,
      reviews: 778,
      image:
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxmYWNpYWwlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzU3OTE5OTU1fDA&ixlib=rb-4.0&q=80&w=1080",
      services: ["HydraFacial", "Chemical Peel", "Anti-aging"],
      priceRange: "₹1000 - ₹6000",
      badge: "skincare clinic",
      nextAvailable: "Today 4:15 PM",
      stylist: "Dr. Anitha Raj",
      specialOffer: "Skin analysis free",
    },
  ];

  const filteredSalons = salons.filter((salon) => {
    const searchMatch =
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.services.some((service) =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return searchMatch;
  });

  return (
    <section
      id="book"
      className="py-24 bg-gradient-to-br from-gray-50 via-white to-orange-50/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            Book Your Perfect{" "}
            <span className="bg-gradient-to-r from-[#FF7A00] via-orange-500 to-[#FF7A00] bg-clip-text text-transparent bg-[length:400%_400%]">
              Beauty Experience
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover premium salons, book instantly, and enjoy personalized
            beauty services with our AI-powered recommendation system
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FF7A00] transition-colors" />
              <Input
                type="text"
                placeholder="Search location or salon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00] transition-all bg-white/50"
              />
            </div>

            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="h-14 rounded-2xl border-gray-200 bg-white/50">
                <SelectValue placeholder="Select service" />
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

            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FF7A00] transition-colors" />
              <Input
                type="date"
                className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00] bg-white/50"
              />
            </div>

            <Button
              onClick={() =>
                toast.success("AI is finding the perfect salons for you...")
              }
              className="h-14 bg-gradient-to-r from-[#FF7A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              AI Search
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Filter Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-12 justify-center"
        >
          {[
            "Recommended",
            "Nearby",
            "Premium",
            "Budget Friendly",
            "Quick Service",
          ].map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full text-gray-700 hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] transition-all duration-300 shadow-sm"
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {/* Salon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSalons.map((salon, index) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={salon.image}
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Category Badge */}
                  <Badge className="absolute top-4 left-4 bg-black/70 text-white border-0 backdrop-blur-sm rounded-lg px-3 py-1">
                    {salon.badge}
                  </Badge>

                  {/* Favorite Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(salon.id)}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        favorites.has(salon.id)
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      }`}
                    />
                  </motion.button>

                  {/* Special Offer Banner */}
                  {salon.specialOffer && (
                    <div className="absolute bottom-4 left-4 bg-[#FF7A00] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {salon.specialOffer}
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Salon Info */}
                  <div className="mb-4">
                    <CardTitle className="text-xl font-bold text-black mb-2 group-hover:text-[#FF7A00] transition-colors">
                      {salon.name}
                    </CardTitle>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(salon.rating)
                                ? "fill-[#FF7A00] text-[#FF7A00]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {salon.rating} ({salon.reviews})
                      </span>
                    </div>

                    {/* Location */}
                    <CardDescription className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {salon.location}
                    </CardDescription>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {salon.services.slice(0, 3).map((service, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Price and Availability */}
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-[#FF7A00]">
                        {salon.priceRange}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {salon.nextAvailable}
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button
                    onClick={() => onBookAppointment?.(salon.id)}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="relative z-10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Book Appointment
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Popular Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24"
        >
          <h3 className="font-display text-3xl font-bold text-black mb-12 text-center">
            Popular Services This Week
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-white/20"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h4 className="font-semibold text-sm text-black group-hover:text-[#FF7A00] transition-colors">
                  {service.name}
                </h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
