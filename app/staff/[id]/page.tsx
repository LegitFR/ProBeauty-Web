"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Award,
  Star,
  Calendar,
  Loader2,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StaffReviewsList from "@/components/StaffReviewsList";
import { getStaffById, type Staff } from "@/lib/api/staff";
import { toast } from "sonner";

export default function StaffDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStaffDetails = async () => {
      try {
        const response = await getStaffById(staffId);
        setStaff(response.data);
      } catch (error: any) {
        console.error("Error loading staff details:", error);
        toast.error("Failed to load staff details");
      } finally {
        setIsLoading(false);
      }
    };

    if (staffId) {
      loadStaffDetails();
    }
  }, [staffId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#ECE3DC] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#ECE3DC] flex items-center justify-center">
        <Card className="border-[#D4C5B9] bg-[#ECE3DC] p-8">
          <p className="text-[#8B7355]">Staff member not found</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4 border-[#8B7355] text-[#8B7355]"
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const staffImage =
    staff.image || staff.user?.profilePicture || staff.user?.image;
  const staffName = staff.name || staff.user?.name || "Staff Member";

  const getDaysAvailable = () => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return days.filter(
      (day) =>
        staff.availability?.[day as keyof typeof staff.availability]
          ?.isAvailable,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#ECE3DC]">
      {/* Header */}
      <div className="bg-[#ECE3DC] border-b border-[#D4C5B9] sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-[#8B7355] hover:bg-[#8B7355]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Staff Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Staff Profile Card */}
            <Card className="border-[#D4C5B9] bg-[#ECE3DC] overflow-hidden">
              <CardContent className="p-0">
                {/* Profile Image */}
                <div className="relative h-80 w-full bg-gradient-to-br from-[#8B7355] to-[#6B5744]">
                  {staffImage ? (
                    <Image
                      src={staffImage}
                      alt={staffName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Award className="h-32 w-32 text-[#ECE3DC]/40" />
                    </div>
                  )}
                </div>

                {/* Staff Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[#8B7355] mb-2">
                      {staffName}
                    </h1>
                    {staff.user?.email && (
                      <p className="text-sm text-[#8B7355]/70">
                        {staff.user.email}
                      </p>
                    )}
                    {staff.user?.phone && (
                      <p className="text-sm text-[#8B7355]/70">
                        {staff.user.phone}
                      </p>
                    )}
                  </div>

                  {staff.salon && (
                    <div className="flex items-start gap-2 pt-2">
                      <MapPin className="h-4 w-4 text-[#8B7355]/70 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-[#8B7355]">
                          {staff.salon.name}
                        </p>
                        {staff.salon.address && (
                          <p className="text-xs text-[#8B7355]/60">
                            {staff.salon.address}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Availability Card */}
            <Card className="border-[#D4C5B9] bg-[#ECE3DC]">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#8B7355]" />
                  <h3 className="font-semibold text-[#8B7355]">Availability</h3>
                </div>

                <div className="space-y-2">
                  {Object.entries(staff.availability || {}).map(
                    ([day, schedule]) => {
                      const daySchedule = schedule as {
                        isAvailable: boolean;
                        slots?: Array<{ start: string; end: string }>;
                      };
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm font-medium text-[#8B7355] capitalize">
                            {day}
                          </span>
                          {daySchedule?.isAvailable ? (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {daySchedule.slots &&
                              daySchedule.slots.length > 0 ? (
                                daySchedule.slots.map((slot, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="bg-green-100 text-green-700 border-green-200 text-xs"
                                  >
                                    {slot.start} - {slot.end}
                                  </Badge>
                                ))
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700 border-green-200"
                                >
                                  Available
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-[#8B7355]/10 text-[#8B7355]/60 border-[#8B7355]/20"
                            >
                              Not Available
                            </Badge>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Services & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            {staff.services && staff.services.length > 0 && (
              <Card className="border-[#D4C5B9] bg-[#ECE3DC]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#8B7355]" />
                    <h3 className="text-xl font-bold text-[#8B7355]">
                      Services Offered
                    </h3>
                  </div>

                  <div className="grid gap-4">
                    {staff.services.map((service: any) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-[#D4C5B9]/50"
                      >
                        <div>
                          <p className="font-semibold text-[#8B7355]">
                            {service.title ||
                              service.service?.title ||
                              "Service"}
                          </p>
                          {service.durationMinutes && (
                            <p className="text-sm text-[#8B7355]/60 mt-1">
                              Duration: {service.durationMinutes} minutes
                            </p>
                          )}
                        </div>
                        {service.price && (
                          <p className="text-lg font-bold text-[#8B7355]">
                            ₹{service.price}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() =>
                      router.push(
                        `/salons/${staff.salonId}?staffId=${staff.id}`,
                      )
                    }
                    className="w-full bg-[#8B7355] text-[#ECE3DC] hover:bg-[#6B5744]"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <StaffReviewsList staffId={staffId} />
          </div>
        </div>
      </div>
    </div>
  );
}
