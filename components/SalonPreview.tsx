"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSalons, type Salon } from "@/lib/api/salon";
import { Calendar, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { motion } from "motion/react";

export function SalonPreview() {
  const router = useRouter();
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

  if (loading) {
    return (
      <section className="py-12 bg-[#ECE3DC]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (salons.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-[#ECE3DC]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Salon Grid - Same design as SalonBooking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-4">
          {salons.map((salon, index) => (
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
                {/* Image Section */}
                <div className="relative aspect-video overflow-hidden bg-transparent p-4">
                  <img
                    src={
                      salon.id.charCodeAt(0) % 7 === 1
                        ? "https://images.unsplash.com/photo-1562322140-8baeececf3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWF1dHklMjBzYWxvbiUyMGludGVyaW9yfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080"
                        : salon.id.charCodeAt(0) % 7 === 3
                        ? "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxzcGElMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080"
                        : salon.id.charCodeAt(0) % 7 === 4
                        ? "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxzYWxvbiUyMGNoYWlyfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080"
                        : salon.id.charCodeAt(0) % 7 === 5
                        ? "https://images.unsplash.com/photo-1560066984-138dadb4c035?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYWxvbnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080"
                        : salon.id.charCodeAt(0) % 7 === 6
                        ? "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxmYWNpYWwlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzU3OTE5OTU1fDA&ixlib=rb-4.0&q=80&w=1080"
                        : "https://images.unsplash.com/photo-1633681926035-ec90e342ced9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWF1dHklMjBzYWxvbiUyMGludGVyaW9yfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080"
                    }
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
                  />
                </div>

                <CardContent className="p-3 flex flex-col grow">
                  {/* Salon Name */}
                  <CardTitle className="text-base font-semibold text-[#1E1E1E] leading-tight line-clamp-2 mb-2">
                    {salon.name}
                  </CardTitle>

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
                  <CardDescription className="text-sm text-[#1E1E1E] mb-2">
                    {salon.address}
                  </CardDescription>

                  {/* Badge */}
                  <p className="text-xs text-[#616161] mb-2">
                    {salon.verified ? "verified salon" : "beauty salon"}
                  </p>
                </CardContent>

                {/* Book Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/salons/${salon.id}`);
                  }}
                  className="w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 bg-[#1E1E1E] hover:bg-[#2a2a2a] text-[#ECE3DC] font-medium text-xs p-7"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
