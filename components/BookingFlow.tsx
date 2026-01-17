"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, Star, Check, User, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getServicesBySalon, Service } from "@/lib/api/service";
import { createBooking, TimeSlot, getAvailableSlots } from "@/lib/api/booking";
import { getStaffBySalon, Staff } from "@/lib/api/staff";
import { getAccessToken, isAuthenticated } from "@/lib/api/auth";
import { Salon } from "@/lib/api/salon";
import { SalonReviewsSection } from "./SalonReviewsSection";
import { getReviewsBySalon } from "@/lib/api/review";
import { OfferSelector } from "./OfferSelector";
import type { Offer } from "@/lib/types/offer";

type BookingStep = "services" | "professional" | "time" | "confirm" | "login";

interface BookingFlowProps {
  salon: Salon;
  onClose: () => void;
}

export function BookingFlow({ salon, onClose }: BookingFlowProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState<BookingStep>("services");

  // Loading states
  const [servicesLoading, setServicesLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Selection states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isAnyStaff, setIsAnyStaff] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "onspot">(
    "onspot",
  );

  // Offer state - support multiple offers
  const [selectedOffers, setSelectedOffers] = useState<
    Array<{ offer: Offer; discount: number }>
  >([]);
  const offerDiscount = selectedOffers.reduce(
    (sum, item) => sum + item.discount,
    0,
  );

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<string>("Featured");

  // Authentication state
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  // Reviews state
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  // Check authentication on mount
  useEffect(() => {
    setUserAuthenticated(isAuthenticated());
  }, []);

  // Load services when component mounts
  useEffect(() => {
    loadServices();
    loadReviewStats();
  }, [salon.id]);

  // Load staff when service is selected
  useEffect(() => {
    if (selectedService && currentStep === "professional") {
      loadStaff();
    }
  }, [selectedService, currentStep]);

  // Load available slots when staff and date are selected
  useEffect(() => {
    if (selectedService && (selectedStaff || isAnyStaff) && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedService, selectedStaff, isAnyStaff, selectedDate]);

  // Filter categories and their keyword mappings
  const filterCategories = [
    { label: "Featured", keywords: [] }, // Show all for Featured
    { label: "Hair styling and kids", keywords: ["kids", "children", "child"] },
    {
      label: "Hair styling and woman",
      keywords: [
        "women",
        "woman",
        "ladies",
        "female",
        "haircut",
        "hair",
        "styling",
        "color",
        "highlights",
        "balayage",
        "blowout",
      ],
    },
    {
      label: "Hair styling and men",
      keywords: ["men", "man", "male", "beard", "shave", "gentlemen"],
    },
    {
      label: "Facials and skin care",
      keywords: ["facial", "skin", "face", "massage", "spa"],
    },
    {
      label: "Smoothing and Straightening",
      keywords: ["smoothing", "straightening", "keratin", "rebonding"],
    },
    { label: "Makeup", keywords: ["makeup", "make-up", "cosmetic", "bridal"] },
  ];

  // Filter services based on selected filter
  const getFilteredServices = () => {
    if (selectedFilter === "Featured") {
      return services;
    }

    const filter = filterCategories.find((f) => f.label === selectedFilter);
    if (!filter || filter.keywords.length === 0) {
      return services;
    }

    return services.filter((service) => {
      const titleLower = service.title.toLowerCase();
      return filter.keywords.some((keyword) =>
        titleLower.includes(keyword.toLowerCase()),
      );
    });
  };

  const loadReviewStats = async () => {
    try {
      const response = await getReviewsBySalon(salon.id, 1, 1);
      setAverageRating(response.averageRating || 0);
      setTotalReviews(response.pagination.total || 0);
    } catch (error) {
      console.error("Error loading review stats:", error);
      // Silently fail - reviews are not critical
    }
  };

  const loadServices = async () => {
    setServicesLoading(true);
    try {
      console.log(`Loading services for salon: ${salon.id}`);
      const response = await getServicesBySalon(salon.id);
      // Ensure response.data is an array
      const allServices = Array.isArray(response.data) ? response.data : [];
      console.log(`Loaded ${allServices.length} services`);

      // Debug: Log each service's salonId
      console.log("=== SERVICE DEBUGGING ===");
      allServices.forEach((service) => {
        console.log(`Service: ${service.id} (${service.title})`);
        console.log(`  - salonId in response: ${service.salonId}`);
        console.log(`  - Expected salonId: ${salon.id}`);
        console.log(`  - Match: ${service.salonId === salon.id}`);
        console.log(`  - Full service object:`, service);
      });
      console.log("=== END DEBUGGING ===");

      // Filter out services that don't belong to this salon
      // This is a workaround for backend data integrity issues
      const validServices = allServices.filter((service) => {
        if (service.salonId !== salon.id) {
          console.warn(
            `Service ${service.id} (${service.title}) belongs to salon ${service.salonId}, not ${salon.id}. Filtering out.`,
          );
          return false;
        }
        return true;
      });

      if (validServices.length < allServices.length) {
        console.warn(
          `Filtered out ${
            allServices.length - validServices.length
          } invalid services`,
        );
      }

      console.log(`Displaying ${validServices.length} valid services`);
      setServices(validServices);
    } catch (error: any) {
      console.error("Error loading services:", error);
      toast.error(error.message || "Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  };

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      // First, check if salon already has staff data
      const salonStaff = Array.isArray(salon.staff) ? salon.staff : [];
      if (salonStaff.length > 0) {
        console.log(`Using ${salonStaff.length} staff members from salon data`);
        console.log(
          "Staff data from salon:",
          JSON.stringify(salonStaff, null, 2),
        );

        // Debug: Log image field information
        salonStaff.forEach((staff: any, index: number) => {
          console.log(`Staff ${index} image fields:`, {
            id: staff.id,
            name: staff.name || staff.user?.name,
            image: staff.image,
            profilePicture: staff.profilePicture,
            userImage: staff.user?.image,
            userProfilePicture: staff.user?.profilePicture,
          });
        });

        // Filter staff by selected service if service data is available
        let filteredStaff = salonStaff as Staff[];
        if (selectedService) {
          filteredStaff = salonStaff.filter((staff: any) => {
            // Check if staff has services field and can perform the selected service
            if (staff.services && Array.isArray(staff.services)) {
              return staff.services.some(
                (s: any) => s.id === selectedService.id,
              );
            }
            // Check if staff has serviceIds field
            if (staff.serviceIds && Array.isArray(staff.serviceIds)) {
              return staff.serviceIds.includes(selectedService.id);
            }
            // If no service data, include the staff (backward compatibility)
            return true;
          }) as Staff[];
          console.log(
            `Filtered to ${filteredStaff.length} staff members who can perform service: ${selectedService.title}`,
          );
        }

        setStaff(filteredStaff);
        setStaffLoading(false);
        return;
      }

      // If not, fetch from API (fallback) - pass serviceId to get filtered staff
      console.log(
        `Fetching staff from API${
          selectedService ? ` for service: ${selectedService.title}` : ""
        }...`,
      );
      const response = await getStaffBySalon(salon.id, selectedService?.id);
      // Ensure response.data is an array
      const staffData = Array.isArray(response.data) ? response.data : [];

      // Debug: Log image field information from API response
      console.log(`Received ${staffData.length} staff members from API`);
      staffData.forEach((staff: any, index: number) => {
        console.log(`API Staff ${index} image fields:`, {
          id: staff.id,
          name: staff.name || staff.user?.name,
          image: staff.image,
          profilePicture: staff.profilePicture,
          userImage: staff.user?.image,
          userProfilePicture: staff.user?.profilePicture,
        });
      });

      // Additional client-side filtering if backend doesn't support serviceId filtering
      let filteredStaffData = staffData;
      if (selectedService && staffData.length > 0) {
        filteredStaffData = staffData.filter((staff) => {
          // Check if staff has services field and can perform the selected service
          if (staff.services && Array.isArray(staff.services)) {
            return staff.services.some((s) => s.id === selectedService.id);
          }
          // Check if staff has serviceIds field
          if (staff.serviceIds && Array.isArray(staff.serviceIds)) {
            return staff.serviceIds.includes(selectedService.id);
          }
          // If no service data, include the staff (backward compatibility)
          return true;
        });

        if (filteredStaffData.length < staffData.length) {
          console.log(
            `Client-side filtered from ${staffData.length} to ${filteredStaffData.length} staff members`,
          );
        }
      }

      setStaff(filteredStaffData);

      // If no staff available, show a helpful message
      if (filteredStaffData.length === 0) {
        console.warn(
          selectedService
            ? `No staff members can perform service: ${selectedService.title}`
            : "No staff members available for this salon",
        );
        toast.info(
          selectedService
            ? `No staff members are available to perform "${selectedService.title}". Please select a different service or choose "Any Available Staff".`
            : "No staff members are currently available at this salon. Please try again later or contact the salon directly.",
          { duration: 6000 },
        );
      }
    } catch (error: any) {
      console.error("Error loading staff:", error);

      // Show user-friendly error message
      if (
        error.message?.includes("invalid response") ||
        error.message?.includes("Backend returned")
      ) {
        toast.error(
          "Unable to load staff information due to a technical issue. Please try selecting a different salon or contact support.",
          { duration: 6000 },
        );
      } else {
        toast.error(error.message || "Failed to load staff members");
      }
      setStaff([]);
    } finally {
      setStaffLoading(false);
    }
  };

  // Filter slots to ensure proper spacing based on service duration
  const filterSlotsByServiceDuration = (slots: TimeSlot[]): TimeSlot[] => {
    if (!selectedService || slots.length === 0) return slots;

    const serviceDurationMs = selectedService.durationMinutes * 60 * 1000;
    const filtered: TimeSlot[] = [];
    let lastSelectedSlotTime: number | null = null;

    // Sort slots by start time
    const sortedSlots = [...slots].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    for (const slot of sortedSlots) {
      const slotStartTime = new Date(slot.startTime).getTime();

      // If this is the first slot or enough time has passed since the last selected slot
      if (
        lastSelectedSlotTime === null ||
        slotStartTime >= lastSelectedSlotTime + serviceDurationMs
      ) {
        filtered.push(slot);
        if (slot.available) {
          lastSelectedSlotTime = slotStartTime;
        }
      }
    }

    console.log(
      `Filtered slots based on ${selectedService.durationMinutes} min service duration: ${sortedSlots.length} -> ${filtered.length} slots`,
    );

    return filtered;
  };

  const loadAvailableSlots = async () => {
    if (!selectedService || (!selectedStaff && !isAnyStaff) || !selectedDate)
      return;

    setSlotsLoading(true);
    try {
      console.log("=== FETCHING AVAILABILITY FROM BACKEND API ===");
      console.log(`Selected Date: ${selectedDate}`);
      console.log(`Salon ID: ${salon.id}`);
      console.log(`Service ID: ${selectedService.id}`);
      console.log(`Staff ID: ${isAnyStaff ? "ANY STAFF" : selectedStaff?.id}`);
      console.log(
        `Service Duration: ${selectedService.durationMinutes} minutes`,
      );

      // Call the backend availability API which properly validates staff availability and existing bookings
      const response = await getAvailableSlots({
        salonId: salon.id,
        serviceId: selectedService.id,
        staffId: isAnyStaff ? undefined : selectedStaff!.id,
        date: selectedDate,
      });

      console.log("Backend availability response:", response);

      if (response.data && response.data.slots) {
        console.log("=== TIME SLOT ANALYSIS ===");
        console.log("Sample raw slots from backend:");
        response.data.slots.slice(0, 3).forEach((slot, idx) => {
          console.log(`Slot ${idx}:`, {
            startTime: slot.startTime,
            endTime: slot.endTime,
            available: slot.available,
            parsedStart: new Date(slot.startTime).toString(),
            localHours: new Date(slot.startTime).getHours(),
            utcHours: new Date(slot.startTime).getUTCHours(),
          });
        });

        // Filter slots based on service duration to prevent overlapping bookings
        const durationFilteredSlots = filterSlotsByServiceDuration(
          response.data.slots,
        );

        // Filter to only show available slots
        const availableSlots = durationFilteredSlots.filter(
          (slot) => slot.available,
        );

        console.log(
          `Received ${response.data.slots.length} total slots, ${durationFilteredSlots.length} after duration filter, ${availableSlots.length} available`,
        );
        console.log("Sample available slots after filtering:");
        availableSlots.slice(0, 3).forEach((slot, idx) => {
          console.log(`Available Slot ${idx}:`, {
            startTime: slot.startTime,
            formatted: formatTime(slot.startTime),
          });
        });

        if (availableSlots.length === 0) {
          const [year, month, day] = selectedDate.split("-").map(Number);
          const date = new Date(year, month - 1, day);
          const dayOfWeek = date.toLocaleDateString("en-US", {
            weekday: "long",
          });
          toast.info(
            `No available time slots for ${dayOfWeek}. Please select a different date or staff member.`,
          );
        }

        setAvailableSlots(durationFilteredSlots);
      } else {
        console.warn("No slots data in response");
        setAvailableSlots([]);
      }
    } catch (error: any) {
      console.error("Error fetching available slots:", error);
      toast.error(
        error.message ||
          "Failed to fetch available time slots. Please try again.",
      );
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Check if a staff member is available on a specific day
  const isStaffAvailableOnDay = (dateString: string): boolean => {
    if (!selectedStaff || !selectedStaff.availability) {
      console.log(
        `No staff or availability data for ${dateString}, returning true`,
      );
      return true; // If no staff selected or no availability info, assume available
    }

    // Parse date string as local date to avoid timezone issues
    // dateString is in format "YYYY-MM-DD"
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    console.log(`Checking availability for ${dateString} (${dayOfWeek})`);
    console.log("Staff availability:", selectedStaff.availability);
    console.log("Available keys:", Object.keys(selectedStaff.availability));
    console.log("Looking for key:", dayOfWeek);

    const dayAvailability =
      selectedStaff.availability[
        dayOfWeek as keyof typeof selectedStaff.availability
      ];

    console.log(`${dayOfWeek} availability object:`, dayAvailability);
    console.log(`dayAvailability exists:`, !!dayAvailability);
    console.log(`dayAvailability.isAvailable:`, dayAvailability?.isAvailable);

    const result = !!(dayAvailability && dayAvailability.isAvailable);
    console.log(`Final result for ${dateString}:`, result);

    return result;
  };

  // Generate calendar dates - recalculate when staff changes
  const calendarDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    // Set to start of day to avoid timezone issues
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Format date as YYYY-MM-DD using local date components
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const fullDate = `${year}-${month}-${day}`;

      const isAvailable = isStaffAvailableOnDay(fullDate);

      dates.push({
        date: date.getDate(),
        day: date.toLocaleDateString("en", { weekday: "short" }),
        fullDate,
        isToday: i === 0,
        isAvailable,
      });
    }
    console.log("Generated calendar dates:", dates);
    return dates;
  }, [selectedStaff]);

  // Step management
  const steps = [
    {
      key: "services",
      label: "Services",
      active: currentStep === "services",
      completed: selectedService !== null,
    },
    {
      key: "professional",
      label: "Professional",
      active: currentStep === "professional",
      completed: selectedStaff !== null || isAnyStaff,
    },
    {
      key: "time",
      label: "Time",
      active: currentStep === "time",
      completed: selectedDate && selectedTime,
    },
    {
      key: "confirm",
      label: "Confirm",
      active: currentStep === "confirm",
      completed: false,
    },
  ];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep("professional");
  };

  const handleStaffSelect = (staffMember: Staff) => {
    console.log("=== STAFF SELECTED ===");
    console.log("Selected staff:", JSON.stringify(staffMember, null, 2));
    console.log("Staff availability:", staffMember.availability);
    setSelectedStaff(staffMember);
    setIsAnyStaff(false);
    setCurrentStep("time");
  };

  const handleAnyStaffSelect = () => {
    console.log("=== ANY STAFF SELECTED ===");
    setSelectedStaff(null);
    setIsAnyStaff(true);
    setCurrentStep("time");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (slot.available) {
      console.log("=== TIME SLOT SELECTED ===");
      console.log("Slot start time (ISO):", slot.startTime);
      console.log(
        "Slot start time (local):",
        new Date(slot.startTime).toString(),
      );
      console.log(
        "Slot start time (local hours):",
        new Date(slot.startTime).getHours(),
      );
      setSelectedTime(slot.startTime);
    }
  };

  const goBack = () => {
    if (currentStep === "professional") setCurrentStep("services");
    else if (currentStep === "time") setCurrentStep("professional");
    else if (currentStep === "confirm") setCurrentStep("time");
    else if (currentStep === "login") setCurrentStep("confirm");
  };

  const handleConfirmClick = () => {
    if (userAuthenticated) {
      if (paymentMethod === "stripe") {
        handleStripeCheckout();
      } else {
        handleBookingConfirm();
      }
    } else {
      setCurrentStep("login");
    }
  };

  const handleStripeCheckout = async () => {
    if (!selectedService || (!selectedStaff && !isAnyStaff) || !selectedTime) {
      toast.error("Please complete all booking details");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toast.error("Please login to continue");
      setCurrentStep("login");
      return;
    }

    setBookingLoading(true);
    try {
      // Prepare booking data for Stripe checkout
      const bookingData: any = {
        salonId: salon.id,
        serviceId: selectedService.id,
        startTime: selectedTime,
      };

      if (!isAnyStaff && selectedStaff) {
        bookingData.staffId = selectedStaff.id;
      }

      // Call booking checkout endpoint
      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      // Redirect to payment page with client secret and booking ID
      const { clientSecret, booking } = data.data;

      // Store booking details in sessionStorage for the payment page
      sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          bookingId: booking.id,
          clientSecret,
          salonName: salon.name,
          serviceName: selectedService.title,
          startTime: selectedTime,
          price: selectedService.price,
        }),
      );

      // Navigate to payment page
      window.location.href = `/bookings/${booking.id}/payment`;
    } catch (error: any) {
      console.error("Error creating stripe checkout:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedService || (!selectedStaff && !isAnyStaff) || !selectedTime) {
      toast.error("Please complete all booking details");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toast.error("Please login to continue");
      setCurrentStep("login");
      return;
    }

    setBookingLoading(true);
    try {
      console.log("=== BOOKING CONFIRMATION ===");
      console.log("Current time (local):", new Date().toString());
      console.log("Current time (UTC):", new Date().toISOString());
      console.log("Selected time (ISO):", selectedTime);
      console.log("Selected date:", selectedDate);

      const selectedTimeObj = new Date(selectedTime);
      console.log("Selected time (local):", selectedTimeObj.toString());
      console.log("Selected time (UTC):", selectedTimeObj.toISOString());
      console.log("Selected time hours (local):", selectedTimeObj.getHours());
      console.log("Selected time hours (UTC):", selectedTimeObj.getUTCHours());
      console.log("Is selected time in future?", selectedTimeObj > new Date());

      console.log("\nStaff availability for the day:");
      console.log(JSON.stringify(selectedStaff?.availability, null, 2));

      // Prepare booking data - exclude staffId if any staff is selected
      const bookingData: any = {
        salonId: salon.id,
        serviceId: selectedService.id,
        startTime: selectedTime,
      };

      if (!isAnyStaff && selectedStaff) {
        bookingData.staffId = selectedStaff.id;
      }

      const response = await createBooking(token, bookingData);

      console.log("Booking created successfully:", response.data);

      toast.success(
        `Booking confirmed! Your appointment is scheduled for ${formatTime(
          selectedTime,
        )} on ${new Date(selectedDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
      );
      onClose();
    } catch (error: any) {
      console.error("Error creating booking:", error);

      // Provide specific error messages based on the error
      if (error.message?.includes("Staff cannot perform this service")) {
        toast.error(
          `The selected staff member cannot perform "${selectedService?.title}". Please select a different staff member or choose "Any Available Staff".`,
          { duration: 6000 },
        );
      } else if (error.message?.includes("not available")) {
        toast.error(
          "The selected time slot is no longer available. Please select a different time.",
          { duration: 5000 },
        );
      } else {
        toast.error(error.message || "Failed to create booking");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLoginAndBook = () => {
    // This should trigger the AuthModal
    toast.info("Please login to complete your booking");
    // You might want to add a callback here to reopen the booking flow after login
    onClose();
  };

  const handleGuestCheckout = () => {
    setUserAuthenticated(true);
    setCurrentStep("confirm");
  };

  // Format time for display - Display in UTC time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);

    // Display in UTC time
    const formatted = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

    // Uncomment for debugging:
    // console.log(`formatTime: ${isoString} -> ${formatted} UTC (ISO: ${date.toISOString()})`);

    return formatted;
  };

  // Render booking summary sidebar
  const renderBookingSummary = () => (
    <Card className="bg-[#ECE3DC] shadow-lg rounded-2xl overflow-hidden sticky top-6 border-none">
      <CardContent className="p-6">
        {/* Salon Info */}
        <div className="flex items-start space-x-3 mb-6 pb-6 border-b">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
            {salon.thumbnail ||
            (salon.images && salon.images.length > 0 && salon.images[0]) ? (
              <img
                src={salon.thumbnail || salon.images?.[0]}
                alt={salon.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-black mb-1">{salon.name}</h3>
            <div className="flex items-center space-x-1 mb-1">
              <span className="font-medium text-sm">4.5</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < 4 ? "fill-[#FF7A00] text-[#FF7A00]" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600">{salon.address}</p>
          </div>
        </div>

        {/* Selected Service */}
        {selectedService && (
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-medium text-black mb-3 text-sm">Service</h4>
            <div>
              <p className="font-medium text-black mb-1">
                {selectedService.title}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">
                  {selectedService.durationMinutes} mins
                </span>
                <span className="font-semibold text-black">
                  ${selectedService.price}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Staff */}
        {(selectedStaff || isAnyStaff) && (
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-medium text-black mb-3 text-sm">
              Professional
            </h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-black text-sm">
                  {isAnyStaff
                    ? "Any Available Staff"
                    : selectedStaff?.user?.name ||
                      selectedStaff?.name ||
                      "Staff Member"}
                </p>
                <p className="text-xs text-gray-600">
                  {isAnyStaff
                    ? "First available professional"
                    : selectedStaff?.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Date & Time */}
        {selectedDate && selectedTime && (
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-medium text-black mb-3 text-sm">Date & Time</h4>
            <div className="space-y-1">
              <p className="text-sm text-black font-medium">
                {new Date(selectedDate).toLocaleDateString("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600">
                {formatTime(selectedTime)}
              </p>
            </div>
          </div>
        )}

        {/* Total */}
        {selectedService && (
          <div className="bg-[#ECE3DC] -mx-6 -mb-6 px-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Service Price</span>
                <span className="font-semibold text-black">
                  ${selectedService.price}
                </span>
              </div>
              {offerDiscount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700 font-medium">
                    Offer Discount
                  </span>
                  <span className="font-semibold text-green-600">
                    -${offerDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-black">Total</span>
                <span className="font-bold text-xl text-[#FF7A00]">
                  $
                  {(parseFloat(selectedService.price) - offerDiscount).toFixed(
                    2,
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-[#ECE3DC] z-50 overflow-y-auto overflow-x-hidden">
      <div className="min-h-screen bg-[#ECE3DC] py-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 hover:text-[#1e1e1e] rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-semibold text-black font-display">
                Book Appointment
              </h1>
            </div>
          </div>

          {/* Progress Breadcrumb */}
          <div className="mb-8 bg-[#ECE3DC] py-6 px-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-center text-sm flex-wrap gap-y-3">
              {steps.map((step, index) => (
                <>
                  <span
                    key={step.key}
                    className={`px-4 py-3 rounded-full transition-colors ${
                      step.active
                        ? "bg-linear-to-r from-[#FD7501] to-[#F65000] text-white font-medium"
                        : step.completed
                          ? "text-[#26D55A] font-medium"
                          : "text-[#1E1E1E]"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="text-[#1E1E1E] text-lg mx-4 sm:mx-6 md:mx-8">
                      →
                    </span>
                  )}
                </>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Services */}
                {currentStep === "services" && (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#ECE3DC] p-6 rounded-2xl">
                      <h2 className="text-2xl font-medium text-black mb-6">
                        Services
                      </h2>

                      {/* Service Filters */}
                      <div className="flex flex-wrap gap-3 mb-8">
                        {filterCategories.map((filter) => (
                          <button
                            key={filter.label}
                            onClick={() => setSelectedFilter(filter.label)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              selectedFilter === filter.label
                                ? "bg-[#1E1E1E] text-[#ECE3DC]"
                                : "bg-transparent text-[#1E1E1E] hover:bg-gray-200"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>

                      {servicesLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
                        </div>
                      ) : services.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-600">No services available</p>
                        </div>
                      ) : getFilteredServices().length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-600">
                            No services found for this category
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getFilteredServices().map((service) => (
                            <Card
                              key={service.id}
                              className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
                                selectedService?.id === service.id
                                  ? "border-[#FF7A00] bg-orange-50"
                                  : "border-[#CBCBCB] hover:border-gray-300 bg-transparent"
                              }`}
                              onClick={() => handleServiceSelect(service)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-black mb-1">
                                    {service.title}
                                  </h3>
                                  <div className="text-sm text-gray-500">
                                    {service.durationMinutes} minutes
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end ml-4">
                                  <div className="font-semibold text-black mb-3">
                                    ${service.price}
                                  </div>
                                  <Button
                                    variant={
                                      selectedService?.id === service.id
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    className={
                                      selectedService?.id === service.id
                                        ? "bg-linear-to-r from-[#FD7501] to-[#F65000] rounded-xl px-6 py-2"
                                        : "bg-transparent border-[#1e1e1e] text-[#1e1e1e] rounded-xl px-6 py-2"
                                    }
                                  >
                                    {selectedService?.id === service.id
                                      ? "Selected"
                                      : "Book"}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Staff */}
                {currentStep === "professional" && (
                  <motion.div
                    key="professional"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#ECE3DC] p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-4 mb-6">
                        <Button
                          variant="ghost"
                          onClick={goBack}
                          className="p-2 hover:bg-[#CBCBCB] hover:text-[#1e1e1e] rounded-full"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                          <h2 className="text-2xl font-medium text-black">
                            Select Professional
                          </h2>
                        </div>
                      </div>

                      {staffLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
                        </div>
                      ) : staff.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-600">
                            No staff members available
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Any Staff Option */}
                          <Card
                            className="p-5 cursor-pointer hover:border-gray-300 transition-all duration-200 bg-gradient-to-r from-orange-50 to-purple-50 border-2 border-[#FF7A00]"
                            onClick={handleAnyStaffSelect}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#FF7A00] to-[#F65000] shrink-0 flex items-center justify-center">
                                  <User className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-black">
                                    Any Available Staff
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    First available professional
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    We'll assign the best available staff member
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="bg-[#FF7A00] text-white border-[#FF7A00] hover:bg-[#F65000] hover:border-[#F65000] px-6 py-4 rounded-2xl"
                              >
                                Select
                              </Button>
                            </div>
                          </Card>

                          {/* Individual Staff Members */}
                          {staff.map((staffMember) => {
                            // Get staff name - check multiple possible locations
                            const staffName =
                              staffMember.name || // Direct name field (primary)
                              staffMember.user?.name || // User object name (fallback)
                              "Professional"; // Default fallback

                            // Get role with fallback
                            const staffRole =
                              staffMember.role || "Professional";

                            // Get staff image - check multiple possible locations
                            const staffImage =
                              staffMember.image || // Direct image field (primary)
                              (staffMember as any).profilePicture || // profilePicture field (alternative)
                              (staffMember as any).user?.profilePicture || // User object profilePicture (fallback)
                              (staffMember as any).user?.image || // User object image (fallback)
                              null; // No image available

                            // Check available days for this staff
                            const availableDays: string[] = [];
                            if (staffMember.availability) {
                              const days = [
                                "monday",
                                "tuesday",
                                "wednesday",
                                "thursday",
                                "friday",
                                "saturday",
                                "sunday",
                              ];
                              days.forEach((day) => {
                                const dayAvail =
                                  staffMember.availability[
                                    day as keyof typeof staffMember.availability
                                  ];
                                if (dayAvail && dayAvail.isAvailable) {
                                  availableDays.push(
                                    day.charAt(0).toUpperCase() +
                                      day.slice(1, 3),
                                  );
                                }
                              });
                            }

                            return (
                              <Card
                                key={staffMember.id}
                                className="p-5 cursor-pointer hover:border-gray-300 transition-all duration-200 bg-transparent border-2 border-[#CBCBCB]"
                                onClick={() => handleStaffSelect(staffMember)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-purple-100 shrink-0 flex items-center justify-center relative">
                                      {staffImage ? (
                                        <Image
                                          src={staffImage}
                                          alt={staffName}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <User className="h-7 w-7 text-[#FF7A00]" />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-black">
                                        {staffName}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {staffRole}
                                      </p>
                                      {availableDays.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Available: {availableDays.join(", ")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    className="hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] bg-transparent border-[#1E1E1E] px-6 py-4 rounded-2xl"
                                  >
                                    Select
                                  </Button>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Select Time */}
                {currentStep === "time" && (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#ECE3DC] p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-4 mb-6">
                        <Button
                          variant="ghost"
                          onClick={goBack}
                          className="p-2 hover:bg-[#CBCBCB] hover:text-[#1e1e1e] rounded-full"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                          <h2 className="text-2xl font-bold text-black">
                            Select Date & Time
                          </h2>
                        </div>
                      </div>

                      {/* Calendar */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-4 font-medium">
                            {new Date().toLocaleDateString("en", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3">
                            {calendarDates.map((dateObj, index) => {
                              const isDisabled = !dateObj.isAvailable;
                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      handleDateSelect(dateObj.fullDate);
                                    }
                                  }}
                                  disabled={isDisabled}
                                  className={`p-2 sm:p-3 md:p-4 rounded-xl text-center transition-all duration-200 ${
                                    isDisabled
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                      : selectedDate === dateObj.fullDate
                                        ? "bg-[#FF7A00] text-white shadow-lg scale-105"
                                        : dateObj.isToday
                                          ? "bg-blue-600 text-white hover:bg-blue-700"
                                          : "hover:shadow-lg text-[#1E1E1E] bg-[#ECE3DC] border-2 border-[#CBCBCB] hover:border-[#FF7A00]"
                                  }`}
                                  title={
                                    isDisabled
                                      ? "Staff not available on this day"
                                      : ""
                                  }
                                >
                                  <div className="font-bold text-base sm:text-lg">
                                    {dateObj.date}
                                  </div>
                                  <div className="text-[10px] sm:text-xs mt-1 truncate">
                                    {dateObj.day}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                          <div className="space-y-4">
                            <h3 className="font-medium text-black">
                              Available times
                            </h3>
                            {slotsLoading ? (
                              <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
                              </div>
                            ) : availableSlots.length === 0 ? (
                              <div className="text-center py-12">
                                <p className="text-gray-600">
                                  No available time slots for this date
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                                {availableSlots.map((slot) => (
                                  <button
                                    key={slot.startTime}
                                    onClick={() => handleTimeSelect(slot)}
                                    disabled={!slot.available}
                                    className={`p-4 text-center rounded-lg border-2 transition-all duration-200 ${
                                      selectedTime === slot.startTime
                                        ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00] font-semibold"
                                        : slot.available
                                          ? "border-[#CBCBCB] hover:border-[#1E1E1E] bg-[#ECE3DC] text-[#1E1E1E] hover:bg-[#CBCBCB]"
                                          : "border-[#CBCBCB] bg-[#CBCBCB] text-[#616161] cursor-not-allowed"
                                    }`}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>{formatTime(slot.startTime)}</span>
                                      {selectedTime === slot.startTime && (
                                        <Check className="h-4 w-4 ml-2" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {selectedDate && selectedTime && (
                          <Button
                            onClick={() => setCurrentStep("confirm")}
                            className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white py-6 rounded-xl"
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Confirm Booking */}
                {currentStep === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#ECE3DC] p-6 rounded-2xl shadow-sm border-4 border-[#1E1E1E]">
                      <div className="flex items-center space-x-4 mb-6">
                        <Button
                          variant="ghost"
                          onClick={goBack}
                          className="p-2 hover:bg-[#CBCBCB] rounded-full"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                          <h2 className="text-2xl font-bold text-black">
                            Confirm booking
                          </h2>
                        </div>
                      </div>

                      {/* Mobile Summary (only visible on mobile) */}
                      <div className="lg:hidden mb-6">
                        {renderBookingSummary()}
                      </div>

                      {/* Offer Selection */}
                      {selectedService && (
                        <div className="mb-6">
                          <OfferSelector
                            cartItems={[
                              {
                                id: selectedService.id,
                                salonId: salon.id,
                                serviceId: selectedService.id,
                              },
                            ]}
                            amount={parseFloat(selectedService.price)}
                            onOffersApplied={(offers) => {
                              setSelectedOffers(offers);
                            }}
                            selectedOffers={selectedOffers}
                          />
                        </div>
                      )}

                      {/* Payment Method Selection */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-black mb-4">
                          Payment Method
                        </h3>
                        <div className="space-y-3">
                          {/* Pay with Stripe */}
                          <button
                            onClick={() => setPaymentMethod("stripe")}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              paymentMethod === "stripe"
                                ? "border-[#FF7A00] bg-orange-50"
                                : "border-[#CBCBCB] bg-white hover:border-[#1E1E1E]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    paymentMethod === "stripe"
                                      ? "bg-[#FF7A00]"
                                      : "bg-[#CBCBCB]"
                                  }`}
                                >
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold text-black">
                                    Pay with Stripe
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Secure online payment
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "stripe" && (
                                <Check className="h-5 w-5 text-[#FF7A00]" />
                              )}
                            </div>
                          </button>

                          {/* Pay on Spot */}
                          <button
                            onClick={() => setPaymentMethod("onspot")}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              paymentMethod === "onspot"
                                ? "border-[#FF7A00] bg-orange-50"
                                : "border-[#CBCBCB] bg-white hover:border-[#1E1E1E]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    paymentMethod === "onspot"
                                      ? "bg-[#FF7A00]"
                                      : "bg-[#CBCBCB]"
                                  }`}
                                >
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold text-black">
                                    Pay on Spot
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Pay after your appointment
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "onspot" && (
                                <Check className="h-5 w-5 text-[#FF7A00]" />
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleConfirmClick}
                        disabled={bookingLoading}
                        className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white py-6 rounded-xl font-semibold text-lg disabled:opacity-50"
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            {paymentMethod === "stripe"
                              ? "Redirecting to payment..."
                              : "Creating booking..."}
                          </>
                        ) : paymentMethod === "stripe" ? (
                          "Proceed to Payment"
                        ) : (
                          "Confirm Appointment"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Login to Book */}
                {currentStep === "login" && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#ECE3DC] p-8 rounded-2xl shadow-sm border-4 border-[#1E1E1E] text-center">
                      <div className="w-16 h-16 bg-[#FF7A00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="h-8 w-8 text-[#FF7A00]" />
                      </div>

                      <h2 className="text-2xl font-bold text-black mb-3">
                        Login to complete booking
                      </h2>
                      <p className="text-gray-600 mb-8">
                        Sign in to manage your bookings and enjoy exclusive
                        benefits
                      </p>

                      <div className="space-y-4 max-w-md mx-auto">
                        <Button
                          onClick={handleLoginAndBook}
                          className="w-full bg-[#F44A01] hover:bg-[#FF7A00]/90 text-white py-6 rounded-xl font-semibold text-lg"
                        >
                          Login / Sign up to continue
                        </Button>

                        <Button
                          onClick={handleGuestCheckout}
                          variant="outline"
                          className="w-full py-6 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-[#FF7A00] hover:text-[#FFFFFF] hover:bg-[#FF7A00] bg-transparent"
                        >
                          Continue as Guest
                        </Button>
                      </div>

                      <button
                        onClick={goBack}
                        className="text-gray-500 hover:text-gray-700 mt-6 text-sm"
                      >
                        ← Go back
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Booking Summary Sidebar (Desktop only) */}
            <div className="lg:col-span-1 hidden lg:block">
              {renderBookingSummary()}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <SalonReviewsSection
              salonId={salon.id}
              averageRating={averageRating}
              totalReviews={totalReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
