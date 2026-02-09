"use client";

import Image from "next/image";
import { Star, Clock, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Staff } from "@/lib/api/staff";

interface StaffCardProps {
  staff: Staff & {
    averageRating?: number;
    totalRatings?: number;
    services?: Array<{
      id: string;
      title?: string;
      price?: number;
      durationMinutes?: number;
    }>;
  };
  onSelect?: (staffId: string) => void;
  onViewDetails?: (staffId: string) => void;
  showActions?: boolean;
}

export default function StaffCard({
  staff,
  onSelect,
  onViewDetails,
  showActions = true,
}: StaffCardProps) {
  const staffImage =
    staff.image || staff.user?.profilePicture || staff.user?.image;
  const staffName = staff.name || staff.user?.name || "Staff Member";

  return (
    <Card className="group overflow-hidden border border-[#D4C5B9] bg-[#ECE3DC] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Staff Image */}
        <div className="relative h-72 w-full overflow-hidden bg-linear-to-br from-[#8B7355] to-[#6B5744]">
          {staffImage ? (
            <Image
              src={staffImage}
              alt={staffName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Award className="h-24 w-24 text-[#ECE3DC]/40" />
            </div>
          )}

          {/* Enhanced Rating Badge */}
          {staff.averageRating &&
            staff.totalRatings &&
            staff.totalRatings > 0 && (
              <div className="absolute top-4 right-4">
                <div
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border-2 transition-all duration-300 group-hover:scale-110 ${
                    staff.averageRating >= 4.5
                      ? "bg-linear-to-br from-amber-400/95 to-yellow-500/95 border-amber-300 shadow-amber-500/50"
                      : staff.averageRating >= 4.0
                        ? "bg-linear-to-br from-orange-400/95 to-amber-400/95 border-orange-300 shadow-orange-500/50"
                        : "bg-[#ECE3DC]/95 border-[#D4C5B9]"
                  }`}
                >
                  {/* Pulsing glow for top ratings */}
                  {staff.averageRating >= 4.5 && (
                    <div className="absolute inset-0 rounded-2xl bg-amber-400/40 animate-pulse" />
                  )}

                  <div className="relative flex items-center gap-2">
                    {/* Star icon */}
                    <Star
                      className={`h-5 w-5 ${
                        staff.averageRating >= 4.0
                          ? "fill-white text-white drop-shadow-md"
                          : "fill-amber-400 text-amber-400"
                      }`}
                    />

                    {/* Rating number */}
                    <div className="flex flex-col items-start">
                      <span
                        className={`font-bold text-lg leading-none ${
                          staff.averageRating >= 4.0
                            ? "text-white drop-shadow"
                            : "text-[#8B7355]"
                        }`}
                      >
                        {staff.averageRating.toFixed(1)}
                      </span>
                      <span
                        className={`text-xs leading-none mt-1 ${
                          staff.averageRating >= 4.0
                            ? "text-white/90"
                            : "text-[#8B7355]/70"
                        }`}
                      >
                        {staff.totalRatings} reviews
                      </span>
                    </div>

                    {/* Trophy icon for excellent ratings */}
                    {staff.averageRating >= 4.8 && (
                      <Award className="h-4 w-4 text-white animate-bounce drop-shadow-md" />
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Staff Info */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <h3 className="text-xl font-bold text-[#8B7355] mb-1">
              {staffName}
            </h3>
            {staff.user?.email && (
              <p className="text-sm text-[#8B7355]/60">{staff.user.email}</p>
            )}

            {/* Visual Star Rating */}
            {staff.averageRating &&
              staff.totalRatings &&
              staff.totalRatings > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 transition-all ${
                          star <= Math.round(staff.averageRating!)
                            ? "fill-amber-400 text-amber-400 scale-110"
                            : star - 0.5 <= staff.averageRating!
                              ? "fill-amber-400/50 text-amber-400"
                              : "fill-gray-300 text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#8B7355]">
                    {staff.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#8B7355]/60">
                    ({staff.totalRatings} reviews)
                  </span>
                </div>
              )}
          </div>

          {/* Services */}
          {staff.services && staff.services.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#8B7355]/80">
                Specialties:
              </p>
              <div className="flex flex-wrap gap-2">
                {staff.services.slice(0, 3).map((service: any) => (
                  <Badge
                    key={service.id}
                    variant="secondary"
                    className="bg-[#8B7355]/10 text-[#8B7355] hover:bg-[#8B7355]/20 border-[#8B7355]/20"
                  >
                    {service.title || service.service?.title || "Service"}
                  </Badge>
                ))}
                {staff.services.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#8B7355]/10 text-[#8B7355] border-[#8B7355]/20"
                  >
                    +{staff.services.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Availability Preview */}
          <div className="flex items-center gap-2 text-sm text-[#8B7355]/70">
            <Clock className="h-4 w-4" />
            <span>
              {
                Object.values(staff.availability || {}).filter(
                  (day: any) => day?.isAvailable,
                ).length
              }{" "}
              days available
            </span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(staff.id)}
                  className="flex-1 border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-[#ECE3DC]"
                >
                  View Details
                </Button>
              )}
              {onSelect && (
                <Button
                  size="sm"
                  onClick={() => onSelect(staff.id)}
                  className="flex-1 bg-[#8B7355] text-[#ECE3DC] hover:bg-[#6B5744]"
                >
                  Book Now
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
