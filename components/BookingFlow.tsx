"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  ArrowLeft,
  Star,
  Check,
  User,
  X,
  Loader2,
  Award,
  Scissors,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getServicesBySalon, Service } from "@/lib/api/service";
import {
  createBooking,
  TimeSlot,
  getAvailableSlots,
  getAvailableStaffAtTime,
} from "@/lib/api/booking";
import { getStaffBySalon, Staff } from "@/lib/api/staff";
import { getAccessToken, isAuthenticated } from "@/lib/api/auth";
import { Salon } from "@/lib/api/salon";
import { SalonReviewsSection } from "./SalonReviewsSection";
import { getReviewsBySalon } from "@/lib/api/review";
import { OfferSelector } from "./OfferSelector";
import type { Offer } from "@/lib/types/offer";
import type { PaymentMethod } from "@/lib/types/ifthenpay";
import { MBWayPaymentForm } from "./MBWayPaymentForm";
import {
  isMBWayPayment,
  type MBWayPaymentResponse,
} from "@/lib/types/ifthenpay";

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
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  // New state: Map each service to a staff member
  const [serviceStaffMap, setServiceStaffMap] = useState<Map<string, Staff>>(
    new Map(),
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [slotValidationLoading, setSlotValidationLoading] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MBWAY");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [showMBWayPopup, setShowMBWayPopup] = useState(false);
  const [mbwayPayment, setMbwayPayment] =
    useState<MBWayPaymentResponse | null>(null);
  const [mbwayBookingId, setMbwayBookingId] = useState<string | null>(null);

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

  // Load staff when services are selected
  useEffect(() => {
    if (selectedServices.length > 0 && currentStep === "professional") {
      loadStaff();
    }
  }, [selectedServices, currentStep]);

  // Load available slots when all services have staff assigned and date is selected
  useEffect(() => {
    const allServicesHaveStaff = selectedServices.every((service) =>
      serviceStaffMap.has(service.id),
    );

    if (selectedServices.length > 0 && allServicesHaveStaff && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedServices, serviceStaffMap, selectedDate]);

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
      // Always fetch from Staff API to get proper service relationships
      console.log("=== FETCHING STAFF FROM STAFF API ===");
      console.log(`Salon ID: ${salon.id}`);

      const response = await getStaffBySalon(salon.id);
      const staffData = Array.isArray(response.data) ? response.data : [];

      console.log(`Received ${staffData.length} staff members from API`);

      // Debug: Log each staff member's services from API
      staffData.forEach((staff: any, index: number) => {
        const staffName = staff.name || staff.user?.name || "Unknown";
        console.log(`\n👤 Staff ${index + 1}: ${staffName}`);
        console.log(`   ID: ${staff.id}`);

        if (staff.services && Array.isArray(staff.services)) {
          console.log(`   Services array (${staff.services.length} items):`);
          staff.services.forEach((s: any, i: number) => {
            const serviceId = s.service?.id || s.id;
            const serviceTitle =
              s.service?.title || s.title || "Unknown Service";
            const servicePrice = s.service?.price || s.price;
            console.log(`     ${i + 1}. Service ID: ${serviceId}`);
            console.log(`        Title: ${serviceTitle}`);
            console.log(`        Price: €${servicePrice}`);
          });
        } else if (staff.serviceIds && Array.isArray(staff.serviceIds)) {
          console.log(`   Service IDs: ${staff.serviceIds.join(", ")}`);
        } else {
          console.log(`   ⚠️ No service data found`);
        }
      });

      // Load ALL staff - filtering will happen per-service in the UI
      setStaff(staffData);

      if (staffData.length === 0) {
        console.warn("No staff members available for this salon");
        toast.info("No staff members are currently available at this salon.", {
          duration: 4000,
        });
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
    if (selectedServices.length === 0 || slots.length === 0) return slots;

    const totalDurationMs = getTotalDuration() * 60 * 1000;
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
        slotStartTime >= lastSelectedSlotTime + totalDurationMs
      ) {
        filtered.push(slot);
        if (slot.available) {
          lastSelectedSlotTime = slotStartTime;
        }
      }
    }

    console.log(
      `Filtered slots based on ${getTotalDuration()} min total duration: ${sortedSlots.length} -> ${filtered.length} slots`,
    );

    return filtered;
  };

  const loadAvailableSlots = async () => {
    const allServicesHaveStaff = selectedServices.every((service) =>
      serviceStaffMap.has(service.id),
    );

    if (selectedServices.length === 0 || !allServicesHaveStaff || !selectedDate)
      return;

    setSlotsLoading(true);
    try {
      console.log("=== FETCHING AVAILABILITY FROM BACKEND API ===");
      console.log(`Selected Date: ${selectedDate}`);
      console.log(`Salon ID: ${salon.id}`);
      console.log(
        `Service IDs: ${selectedServices.map((s) => s.id).join(", ")}`,
      );
      console.log(`Total Duration: ${getTotalDuration()} minutes`);

      // Log staff assignments
      selectedServices.forEach((service) => {
        const staff = serviceStaffMap.get(service.id);
        console.log(
          `Service "${service.title}" → Staff: ${staff?.user?.name || staff?.name} (ID: ${staff?.id})`,
        );
      });

      // Fetch availability for each staff member separately
      const staffAvailabilityPromises = selectedServices.map((service) => {
        const staff = serviceStaffMap.get(service.id);
        return getAvailableSlots({
          salonId: salon.id,
          serviceIds: [service.id],
          staffId: staff!.id,
          date: selectedDate,
        });
      });

      console.log(
        `\n=== FETCHING AVAILABILITY FOR ${selectedServices.length} STAFF MEMBERS ===`,
      );
      const staffAvailabilityResponses = await Promise.all(
        staffAvailabilityPromises,
      );

      // Extract slots from each staff member's response
      const allStaffSlots = staffAvailabilityResponses.map(
        (response, index) => {
          const service = selectedServices[index];
          const staff = serviceStaffMap.get(service.id);
          const slots = response.data?.slots || [];

          console.log(`\nStaff: ${staff?.user?.name || staff?.name}`);
          console.log(`  Service: ${service.title}`);
          console.log(
            `  Available slots: ${slots.filter((s) => s.available).length}`,
          );

          return {
            staffId: staff!.id,
            staffName: staff?.user?.name || staff?.name,
            serviceName: service.title,
            slots: slots,
          };
        },
      );

      // Find common time slots across all staff members
      // A slot is common if the startTime exists and is available for ALL staff
      console.log("\n=== FINDING COMMON TIME SLOTS ===");

      if (
        allStaffSlots.length === 0 ||
        allStaffSlots.some((s) => s.slots.length === 0)
      ) {
        console.log("No slots available for one or more staff members");
        setAvailableSlots([]);
        toast.info(
          "No common available time slots found. Please try a different date.",
        );
        setSlotsLoading(false);
        return;
      }

      // Get the first staff's slots as the base
      const baseSlots = allStaffSlots[0].slots;

      // Find slots that exist and are available in ALL staff schedules
      const commonSlots = baseSlots.filter((baseSlot) => {
        // Check if this slot's startTime is available for all other staff
        const isCommonSlot = allStaffSlots.every((staffData) => {
          // Find a matching slot by startTime (string comparison)
          const matchingSlot = staffData.slots.find(
            (slot) => slot.startTime === baseSlot.startTime,
          );

          // Slot must exist and be available for this staff
          return matchingSlot && matchingSlot.available;
        });

        return isCommonSlot && baseSlot.available;
      });

      console.log(`Total staff members: ${allStaffSlots.length}`);
      allStaffSlots.forEach((staffData) => {
        console.log(
          `  ${staffData.staffName}: ${staffData.slots.filter((s) => s.available).length} available slots`,
        );
      });
      console.log(`Common available slots: ${commonSlots.length}`);

      // Log sample common slots
      if (commonSlots.length > 0) {
        console.log("\nSample common slots:");
        commonSlots.slice(0, 3).forEach((slot, idx) => {
          console.log(
            `  ${idx + 1}. ${formatTime(slot.startTime)} (${slot.startTime})`,
          );
        });
      }

      // Filter slots based on service duration to prevent overlapping bookings
      const durationFilteredSlots = filterSlotsByServiceDuration(commonSlots);

      console.log(
        `After duration filter: ${durationFilteredSlots.length} slots`,
      );

      if (durationFilteredSlots.length === 0) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.toLocaleDateString("en-US", {
          weekday: "long",
        });
        toast.info(
          `No common available time slots for all staff on ${dayOfWeek}. Please try a different date.`,
        );
      }

      setAvailableSlots(durationFilteredSlots);
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

  // Check if any assigned staff is available on a specific day
  const isStaffAvailableOnDay = (dateString: string): boolean => {
    // With multi-service bookings, we'll let the availability API handle filtering
    // Always return true here and let the time slots endpoint determine actual availability
    return true;
  };

  // Generate calendar dates - recalculate when staff assignments change
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
    return dates;
  }, [serviceStaffMap]);

  // Helper functions for calculating totals
  const getTotalDuration = () => {
    return selectedServices.reduce(
      (sum, service) => sum + service.durationMinutes,
      0,
    );
  };

  const getTotalPrice = () => {
    return selectedServices.reduce(
      (sum, service) => sum + parseFloat(service.price),
      0,
    );
  };

  const getFinalPrice = () => {
    return getTotalPrice() - offerDiscount;
  };

  // Validate if selected staff can perform all selected services
  const validateStaffServices = (staff: Staff): boolean => {
    if (!staff || selectedServices.length === 0) return true;

    // Check if staff has services field
    if (staff.services && Array.isArray(staff.services)) {
      const staffServiceIds = staff.services.map(
        (s: any) => s.service?.id || s.id,
      );
      const canPerformAll = selectedServices.every((service) =>
        staffServiceIds.includes(service.id),
      );
      console.log("Staff validation (services field):", {
        staffName: staff.user?.name || staff.name,
        staffServiceIds,
        selectedServiceIds: selectedServices.map((s) => s.id),
        canPerformAll,
      });
      return canPerformAll;
    }

    // Check if staff has serviceIds field
    if (staff.serviceIds && Array.isArray(staff.serviceIds)) {
      const canPerformAll = selectedServices.every((service) =>
        (staff.serviceIds || []).includes(service.id),
      );
      console.log("Staff validation (serviceIds field):", {
        staffName: staff.user?.name || staff.name,
        staffServiceIds: staff.serviceIds,
        selectedServiceIds: selectedServices.map((s) => s.id),
        canPerformAll,
      });
      return canPerformAll;
    }

    // If no service data, cannot validate - return false for safety
    console.warn("Staff has no service assignment data - validation failed");
    return false;
  };

  // Step management
  const steps = [
    {
      key: "services",
      label: "Services",
      active: currentStep === "services",
      completed: selectedServices.length > 0,
    },
    {
      key: "professional",
      label: "Professional",
      active: currentStep === "professional",
      completed:
        selectedServices.length > 0 &&
        selectedServices.every((service) => serviceStaffMap.has(service.id)),
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
    // Toggle service selection
    const isSelected = selectedServices.some((s) => s.id === service.id);
    if (isSelected) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
      // Clean up staff assignment for deselected service
      setServiceStaffMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(service.id);
        return newMap;
      });
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleContinueToStaff = () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }
    setCurrentStep("professional");
  };

  const handleServiceStaffSelect = (
    serviceId: string,
    staffMember: Staff | null,
  ) => {
    if (staffMember === null) {
      // Remove staff assignment
      setServiceStaffMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(serviceId);
        return newMap;
      });
      console.log("=== STAFF ASSIGNMENT REMOVED ===");
      console.log("Service ID:", serviceId);
      return;
    }

    console.log("=== STAFF ASSIGNED TO SERVICE ===");
    console.log("Service ID:", serviceId);
    console.log("Staff:", staffMember.user?.name || staffMember.name);

    setServiceStaffMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(serviceId, staffMember);
      return newMap;
    });
  };

  const handleContinueToTime = () => {
    // Check if all currently selected services have staff assigned
    const allServicesHaveStaff = selectedServices.every((service) =>
      serviceStaffMap.has(service.id),
    );

    if (!allServicesHaveStaff) {
      toast.error("Please assign staff to all selected services");
      return;
    }
    setCurrentStep("time");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const handleTimeSelect = async (slot: TimeSlot) => {
    if (slot.available) {
      setSlotValidationLoading(slot.startTime);

      try {
        const availabilityChecks = await Promise.all(
          selectedServices.map(async (service) => {
            const assignedStaff = serviceStaffMap.get(service.id);
            if (!assignedStaff) {
              return {
                serviceTitle: service.title,
                staffName: "",
                available: false,
              };
            }

            const response = await getAvailableStaffAtTime({
              salonId: salon.id,
              serviceId: service.id,
              startTime: slot.startTime,
            });

            const available = (response.data || []).some(
              (staff) => staff.id === assignedStaff.id,
            );

            return {
              serviceTitle: service.title,
              staffName: assignedStaff.user?.name || assignedStaff.name || "",
              available,
            };
          }),
        );

        const unavailableAssignment = availabilityChecks.find(
          (check) => !check.available,
        );

        if (unavailableAssignment) {
          toast.error(
            `${unavailableAssignment.staffName || "Selected staff"} is no longer available for ${unavailableAssignment.serviceTitle} at this time. Please select another slot.`,
            { duration: 5000 },
          );
          setSelectedTime("");
          await loadAvailableSlots();
          return;
        }

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
      } catch (error) {
        toast.error("Could not validate this slot. Please try another time.");
      } finally {
        setSlotValidationLoading(null);
      }
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
      if (paymentMethod === "ONSPOT") {
        handleBookingConfirm();
        return;
      }

      handlePaymentCheckout();
    } else {
      setCurrentStep("login");
    }
  };

  const handlePaymentCheckout = async () => {
    const allServicesHaveStaff = selectedServices.every((service) =>
      serviceStaffMap.has(service.id),
    );

    if (
      selectedServices.length === 0 ||
      !allServicesHaveStaff ||
      !selectedTime
    ) {
      toast.error("Please complete all booking details");
      return;
    }

    // Validate mobile number for MBWAY
    if (paymentMethod === "MBWAY" && !mobileNumber) {
      toast.error("Please enter your mobile number for MB WAY payment");
      return;
    }

    if (paymentMethod === "MBWAY") {
      const mbwayFormatRegex = /^\d{1,4}#\d{6,15}$/;
      if (!mbwayFormatRegex.test(mobileNumber)) {
        toast.error(
          "Invalid MB WAY number format. Please use: countryCode#phoneNumber (e.g., 351#912345678)",
          { duration: 5000 },
        );
        return;
      }
    }

    const token = getAccessToken();
    if (!token) {
      toast.error("Please login to continue");
      setCurrentStep("login");
      return;
    }

    setBookingLoading(true);
    try {
      // Prepare booking data
      const serviceIds = selectedServices.map((s) => s.id);
      const staffIds = selectedServices.map((service) => {
        const staff = serviceStaffMap.get(service.id);
        return staff!.id;
      });

      // Re-validate exact staff availability at selected start time to avoid stale slot race conditions
      const availabilityChecks = await Promise.all(
        selectedServices.map(async (service) => {
          const assignedStaff = serviceStaffMap.get(service.id);
          if (!assignedStaff) {
            return {
              serviceId: service.id,
              serviceTitle: service.title,
              staffId: "",
              available: false,
            };
          }

          const response = await getAvailableStaffAtTime({
            salonId: salon.id,
            serviceId: service.id,
            startTime: selectedTime,
          });

          const available = (response.data || []).some(
            (staff) => staff.id === assignedStaff.id,
          );

          return {
            serviceId: service.id,
            serviceTitle: service.title,
            staffId: assignedStaff.id,
            staffName: assignedStaff.user?.name || assignedStaff.name,
            available,
          };
        }),
      );

      const unavailableAssignment = availabilityChecks.find(
        (check) => !check.available,
      );

      if (unavailableAssignment) {
        toast.error(
          `${unavailableAssignment.staffName || "Selected staff"} is no longer available for ${unavailableAssignment.serviceTitle} at this time. Please choose another slot or staff member.`,
          { duration: 6000 },
        );
        setSelectedTime("");
        await loadAvailableSlots();
        setCurrentStep("time");
        setBookingLoading(false);
        return;
      }

      const bookingData: any = {
        salonId: salon.id,
        serviceIds,
        staffIds,
        startTime: selectedTime,
        paymentMethod,
      };

      // Add mobile number for MBWAY
      if (paymentMethod === "MBWAY" && mobileNumber) {
        bookingData.mobileNumber = mobileNumber;
      }

      // Log booking data for debugging
      console.log(
        "🔍 Payment Checkout booking data:",
        JSON.stringify(bookingData, null, 2),
      );
      console.log(
        "Service-Staff Mappings:",
        selectedServices.map((service, index) => ({
          serviceId: service.id,
          serviceTitle: service.title,
          staffId: staffIds[index],
          staffName:
            serviceStaffMap.get(service.id)?.user?.name ||
            serviceStaffMap.get(service.id)?.name ||
            "Unknown",
        })),
      );

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

      console.log("=== BOOKING CHECKOUT RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
      console.log("Response data:", JSON.stringify(data, null, 2));
      console.log("Has clientSecret?", !!data?.data?.clientSecret);
      console.log("Has payment object?", !!data?.data?.payment);
      console.log("Selected payment method:", paymentMethod);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      // Store booking details in sessionStorage for the payment page
      const bookingInfo = {
        bookingId: data.data.booking.id,
        salonName: salon.name,
        serviceName: selectedServices.map((s) => s.title).join(", "),
        startTime: selectedTime,
        price: getTotalPrice().toFixed(2),
        paymentMethod,
      };

      // Add payment-specific data
      if (data.data.payment && isMBWayPayment(data.data.payment)) {
        setMbwayPayment(data.data.payment);
        setMbwayBookingId(data.data.booking.id);
        setShowMBWayPopup(true);
        setBookingLoading(false);
        return;
      } else if (data.data.clientSecret) {
        // Stripe payment
        (bookingInfo as any).clientSecret = data.data.clientSecret;
      } else if (data.data.payment) {
        // If-Then Pay payment
        (bookingInfo as any).payment = data.data.payment;
      }

      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingInfo));

      // Navigate to payment page
      window.location.href = `/bookings/${data.data.booking.id}/payment`;
    } catch (error: any) {
      console.error("Error creating payment checkout:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookingConfirm = async () => {
    // Validate all required fields
    const allServicesHaveStaff = selectedServices.every((service) =>
      serviceStaffMap.has(service.id),
    );

    if (
      selectedServices.length === 0 ||
      !allServicesHaveStaff ||
      !selectedTime
    ) {
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

      // Prepare booking data with parallel arrays
      // serviceIds[0] is performed by staffIds[0], serviceIds[1] by staffIds[1], etc.
      const serviceIds = selectedServices.map((s) => s.id);
      const staffIds = selectedServices.map((service) => {
        const staff = serviceStaffMap.get(service.id);
        return staff!.id;
      });

      console.log("\n=== SERVICE-STAFF MAPPING ===");
      selectedServices.forEach((service, index) => {
        const staff = serviceStaffMap.get(service.id);
        console.log(
          `${index + 1}. ${service.title} → ${staff?.user?.name || staff?.name}`,
        );
      });

      const bookingData: any = {
        salonId: salon.id,
        serviceIds,
        staffIds,
        startTime: selectedTime,
      };

      console.log("\nBooking data:", JSON.stringify(bookingData, null, 2));

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
          `The selected staff member cannot perform one or more of the selected services. Please select a different staff member or choose "Any Available Staff".`,
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
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#CBCBCB] shrink-0">
            {salon.thumbnail ||
            (salon.images && salon.images.length > 0 && salon.images[0]) ? (
              <img
                src={salon.thumbnail || salon.images?.[0]}
                alt={salon.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#CBCBCB]">
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
        {selectedServices.length > 0 && (
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-medium text-black mb-3 text-sm">
              {selectedServices.length > 1 ? "Services" : "Service"}
            </h4>
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div key={service.id}>
                  <p className="font-medium text-black mb-1">{service.title}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-600">
                      {service.durationMinutes} mins
                    </span>
                    <span className="font-semibold text-black">
                      €{service.price}
                    </span>
                  </div>
                </div>
              ))}
              {selectedServices.length > 1 && (
                <div className="pt-2 border-t border-[#1e1e1e]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Duration
                    </span>
                    <span className="text-sm font-semibold text-black">
                      {getTotalDuration()} mins
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service-Staff Assignments */}
        {serviceStaffMap.size > 0 && (
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-medium text-black mb-3 text-sm">
              Professionals Assigned
            </h4>
            <div className="space-y-3">
              {Array.from(serviceStaffMap.entries()).map(
                ([serviceId, staff]) => {
                  const service = selectedServices.find(
                    (s) => s.id === serviceId,
                  );
                  if (!service) return null;

                  return (
                    <div
                      key={serviceId}
                      className="flex items-start gap-3 p-3 bg-[#ECE3DC] rounded-xl"
                    >
                      <div className="w-9 h-9 bg-linear-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center shrink-0">
                        {staff.image ? (
                          <div className="w-9 h-9 rounded-full overflow-hidden relative">
                            <Image
                              src={staff.image}
                              alt={
                                staff.user?.name || staff.name || "Professional"
                              }
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <User className="h-4 w-4 text-[#FF7A00]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-black text-sm truncate">
                          {staff.user?.name || staff.name || "Professional"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {service.title}
                        </p>
                        {(staff.averageRating || (staff as any).rating) && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium text-gray-600">
                              {(
                                staff.averageRating ||
                                (staff as any).rating ||
                                0
                              ).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
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
        {selectedServices.length > 0 && (
          <div className="bg-[#ECE3DC] -mx-6 -mb-6 px-6 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  Service{selectedServices.length > 1 ? "s" : ""} Price
                </span>
                <span className="font-semibold text-black">
                  €{getTotalPrice().toFixed(2)}
                </span>
              </div>
              {offerDiscount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700 font-medium">
                    Offer Discount
                  </span>
                  <span className="font-semibold text-green-600">
                    -€{offerDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-black">Total</span>
                <span className="font-bold text-xl text-[#FF7A00]">
                  €{getFinalPrice().toFixed(2)}
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
                className="p-2 hover:bg-[#CBCBCB] hover:text-[#1e1e1e] rounded-full"
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
                                : "bg-transparent text-[#1E1E1E] hover:bg-[#CBCBCB]"
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
                        <>
                          <div className="space-y-4 mb-6">
                            {getFilteredServices().map((service) => {
                              const isSelected = selectedServices.some(
                                (s) => s.id === service.id,
                              );
                              return (
                                <Card
                                  key={service.id}
                                  className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
                                    isSelected
                                      ? "border-[#FF7A00] bg-orange-50"
                                      : "border-[#CBCBCB] hover:border-[#1e1e1e] bg-[#ECE3DC]"
                                  }`}
                                  onClick={() => handleServiceSelect(service)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-3 flex-1">
                                      <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                                          isSelected
                                            ? "bg-[#FF7A00] border-[#FF7A00]"
                                            : "border-[#1e1e1e]"
                                        }`}
                                      >
                                        {isSelected && (
                                          <Check className="h-3 w-3 text-white" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-black mb-1">
                                          {service.title}
                                        </h3>
                                        <div className="text-sm text-gray-500">
                                          {service.durationMinutes} minutes
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="font-semibold text-black">
                                        €{service.price}
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                          {selectedServices.length > 0 && (
                            <div className="flex justify-end">
                              <Button
                                onClick={handleContinueToStaff}
                                className="bg-linear-to-r from-[#FD7501] to-[#F65000] text-white rounded-xl px-8 py-3 hover:opacity-90"
                              >
                                Continue with {selectedServices.length} Service
                                {selectedServices.length > 1 ? "s" : ""}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Staff for Each Service */}
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
                        <div className="flex-1">
                          <h2 className="text-2xl font-medium text-black">
                            Assign Professionals
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Select a professional for each service
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#ECE3DC] rounded-full shadow-sm border border-[#1e1e1e]">
                          <CheckCircle2 className="h-4 w-4 text-[#FF7A00]" />
                          <span className="text-sm font-medium text-gray-700">
                            {
                              selectedServices.filter((s) =>
                                serviceStaffMap.has(s.id),
                              ).length
                            }{" "}
                            / {selectedServices.length}
                          </span>
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
                        <div className="space-y-6">
                          {/* Service-by-Service Staff Selection */}
                          {selectedServices.map((service, index) => {
                            const assignedStaff = serviceStaffMap.get(
                              service.id,
                            );
                            const isAssigned = !!assignedStaff;

                            // Filter staff who can perform this specific service
                            console.log(
                              `\n=== FILTERING STAFF FOR SERVICE: ${service.title} ===`,
                            );
                            console.log(`Service ID: ${service.id}`);
                            console.log(
                              `Total staff available: ${staff.length}`,
                            );

                            const qualifiedStaff = staff.filter((s) => {
                              const staffName =
                                s.user?.name || s.name || "Unknown";

                              // Check if this staff has the services array
                              if (!s.services || !Array.isArray(s.services)) {
                                console.log(
                                  `❌ ${staffName}: No services array`,
                                );
                                return false;
                              }

                              // Extract all service IDs this staff can perform
                              const staffServiceIds = s.services.map((ss) => {
                                const serviceId = ss.service?.id || ss.id;
                                return serviceId;
                              });

                              console.log(
                                `   ${staffName} can perform services: [${staffServiceIds.join(", ")}]`,
                              );

                              // Check if any of the staff's services match this service
                              const canPerform = staffServiceIds.includes(
                                service.id,
                              );
                              console.log(
                                `   ${canPerform ? "✅" : "❌"} ${staffName} can${canPerform ? "" : "not"} perform "${service.title}"`,
                              );

                              return canPerform;
                            });

                            console.log(
                              `\nResult: ${qualifiedStaff.length} qualified staff for "${service.title}"`,
                            );
                            if (qualifiedStaff.length > 0) {
                              console.log(
                                `Qualified: ${qualifiedStaff.map((s) => s.user?.name || s.name).join(", ")}`,
                              );
                            }

                            return (
                              <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-[#ECE3DC] rounded-2xl p-5 border-2 transition-all duration-300 ${
                                  isAssigned
                                    ? "border-[#FF7A00] shadow-lg shadow-orange-100"
                                    : "border-[#CBCBCB] shadow-sm"
                                }`}
                              >
                                {/* Service Header */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1e1e1e]">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        isAssigned
                                          ? "bg-linear-to-br from-[#FF7A00] to-[#F65000]"
                                          : "bg-[#CBCBCB]"
                                      }`}
                                    >
                                      {isAssigned ? (
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                      ) : (
                                        <Scissors className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-black">
                                        {service.title}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        €{service.price} •{" "}
                                        {service.durationMinutes} min
                                      </p>
                                    </div>
                                  </div>
                                  {isAssigned && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-orange-50 to-purple-50 rounded-full"
                                    >
                                      <User className="h-3.5 w-3.5 text-[#FF7A00]" />
                                      <span className="text-xs font-medium text-[#FF7A00]">
                                        Assigned
                                      </span>
                                    </motion.div>
                                  )}
                                </div>

                                {/* Currently Assigned Staff (if any) */}
                                {isAssigned && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-4 p-4 bg-linear-to-r from-orange-50 to-purple-50 rounded-xl border border-orange-200"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-orange-100 to-purple-100 shrink-0 flex items-center justify-center relative">
                                          {assignedStaff.image ? (
                                            <Image
                                              src={assignedStaff.image}
                                              alt={
                                                assignedStaff.user?.name ||
                                                assignedStaff.name ||
                                                "Professional"
                                              }
                                              fill
                                              className="object-cover"
                                            />
                                          ) : (
                                            <User className="h-6 w-6 text-[#FF7A00]" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-semibold text-black">
                                            {assignedStaff.user?.name ||
                                              assignedStaff.name ||
                                              "Professional"}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            {assignedStaff.role ||
                                              "Professional"}
                                          </p>
                                          {(assignedStaff.averageRating ||
                                            (assignedStaff as any).rating) && (
                                            <div className="flex items-center gap-1 mt-1">
                                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                              <span className="text-xs font-medium text-gray-700">
                                                {(
                                                  assignedStaff.averageRating ||
                                                  (assignedStaff as any)
                                                    .rating ||
                                                  0
                                                ).toFixed(1)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleServiceStaffSelect(
                                            service.id,
                                            null,
                                          )
                                        }
                                        className="text-[#FF7A00] hover:text-[#F65000] hover:bg-orange-100"
                                      >
                                        Change
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}

                                {/* Staff Selection (show if not assigned or if scrolled to view) */}
                                {!isAssigned && (
                                  <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                      Choose a professional:
                                    </p>
                                    {qualifiedStaff.length === 0 ? (
                                      <div className="text-center py-6 bg-[#ECE3DC] rounded-xl border border-[#CBCBCB]">
                                        <p className="text-sm text-gray-500">
                                          No professionals available for this
                                          service
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {qualifiedStaff.map((staffMember) => {
                                          const staffName =
                                            staffMember.name ||
                                            staffMember.user?.name ||
                                            "Professional";
                                          const staffRole =
                                            staffMember.role || "Professional";
                                          const staffImage =
                                            staffMember.image ||
                                            (staffMember as any)
                                              .profilePicture ||
                                            (staffMember as any).user
                                              ?.profilePicture ||
                                            (staffMember as any).user?.image ||
                                            null;

                                          return (
                                            <div
                                              key={staffMember.id}
                                              className="p-4 rounded-xl border-2 border-[#CBCBCB] hover:border-[#FF7A00] bg-[#ECE3DC] cursor-pointer transition-all duration-200 hover:shadow-md"
                                              onClick={() =>
                                                handleServiceStaffSelect(
                                                  service.id,
                                                  staffMember,
                                                )
                                              }
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-11 h-11 rounded-full overflow-hidden bg-linear-to-br from-orange-100 to-purple-100 shrink-0 flex items-center justify-center relative">
                                                    {staffImage ? (
                                                      <Image
                                                        src={staffImage}
                                                        alt={staffName}
                                                        fill
                                                        className="object-cover"
                                                      />
                                                    ) : (
                                                      <User className="h-5 w-5 text-[#FF7A00]" />
                                                    )}
                                                  </div>
                                                  <div className="flex-1">
                                                    <h4 className="font-semibold text-black text-sm">
                                                      {staffName}
                                                    </h4>
                                                    <p className="text-xs text-gray-600">
                                                      {staffRole}
                                                    </p>
                                                    {(staffMember.averageRating ||
                                                      (staffMember as any)
                                                        .rating) && (
                                                      <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50">
                                                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                                          <span className="text-xs font-medium text-gray-700">
                                                            {(
                                                              staffMember.averageRating ||
                                                              (
                                                                staffMember as any
                                                              ).rating ||
                                                              0
                                                            ).toFixed(1)}
                                                          </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                          (
                                                          {staffMember.totalRatings ||
                                                            (staffMember as any)
                                                              .reviewCount ||
                                                            0}
                                                          )
                                                        </span>
                                                        {(staffMember.averageRating ||
                                                          (staffMember as any)
                                                            .rating ||
                                                          0) >= 4.8 && (
                                                          <div className="flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                                                            <Award className="h-2.5 w-2.5" />
                                                            <span>Top</span>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                                <Button
                                                  size="sm"
                                                  className="bg-[#FF7A00] text-white hover:bg-[#F65000] rounded-lg px-4"
                                                >
                                                  Select
                                                </Button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Continue Button */}
                      {selectedServices.every((service) =>
                        serviceStaffMap.has(service.id),
                      ) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 pt-6 border-t border-[#1e1e1e]"
                        >
                          <Button
                            onClick={handleContinueToTime}
                            className="w-full bg-linear-to-r from-[#FF7A00] to-[#F65000] text-white hover:from-[#F65000] hover:to-[#FF7A00] py-6 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Continue to Time Selection
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </motion.div>
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
                          {selectedServices.length > 1 && (
                            <p className="text-sm text-gray-600 mt-1">
                              Showing times when all {selectedServices.length}{" "}
                              staff members are available
                            </p>
                          )}
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
                                      ? "bg-[#CBCBCB] text-gray-400 cursor-not-allowed opacity-50"
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
                            <div>
                              <h3 className="font-medium text-black">
                                Available times
                              </h3>
                              {selectedServices.length > 1 &&
                                availableSlots.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Times when all assigned staff are available
                                  </p>
                                )}
                            </div>
                            {slotsLoading ? (
                              <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
                              </div>
                            ) : availableSlots.length === 0 ? (
                              <div className="text-center py-12">
                                <p className="text-gray-600">
                                  {selectedServices.length > 1
                                    ? "No common time slots available for all staff members on this date. Try a different date."
                                    : "No available time slots for this date"}
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                                {availableSlots.map((slot) => (
                                  <button
                                    key={slot.startTime}
                                    onClick={() => handleTimeSelect(slot)}
                                    disabled={!slot.available || !!slotValidationLoading}
                                    className={`p-4 text-center rounded-lg border-2 transition-all duration-200 ${
                                      selectedTime === slot.startTime
                                        ? "border-[#FF7A00] bg-orange-50 text-white font-semibold"
                                      : slot.available
                                        ? "border-[#CBCBCB] hover:border-[#1E1E1E] bg-[#ECE3DC] text-[#1E1E1E] hover:bg-[#CBCBCB]"
                                          : "border-[#CBCBCB] bg-[#CBCBCB] text-[#616161] cursor-not-allowed"
                                    }`}
                                  >
                                    <div className="flex items-center justify-center">
                                      <span>
                                        {slotValidationLoading === slot.startTime
                                          ? "Checking..."
                                          : formatTime(slot.startTime)}
                                      </span>
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
                      {selectedServices.length > 0 && (
                        <div className="mb-6">
                          <OfferSelector
                            cartItems={selectedServices.map((service) => ({
                              id: service.id,
                              salonId: salon.id,
                              serviceId: service.id,
                            }))}
                            amount={getTotalPrice()}
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
                          <button
                            onClick={() => setPaymentMethod("MBWAY")}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              paymentMethod === "MBWAY"
                                ? "border-[#FF7A00] bg-[#ECE3DC]"
                                : "border-[#CBCBCB] bg-[#ECE3DC] hover:border-[#1E1E1E]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    paymentMethod === "MBWAY"
                                      ? "bg-[#FF7A00]"
                                      : "bg-[#CBCBCB]"
                                  }`}
                                >
                                  <svg
                                    className="w-6 h-6 text-[#ECE3DC]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold text-black">MB WAY</p>
                                  <p className="text-sm text-gray-600">
                                    Instant payment via mobile app
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "MBWAY" && (
                                <Check className="h-5 w-5 text-[#FF7A00]" />
                              )}
                            </div>
                          </button>

                          <button
                            onClick={() => setPaymentMethod("ONSPOT")}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              paymentMethod === "ONSPOT"
                                ? "border-[#FF7A00] bg-[#ECE3DC]"
                                : "border-[#CBCBCB] bg-[#ECE3DC] hover:border-[#1E1E1E]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    paymentMethod === "ONSPOT"
                                      ? "bg-[#FF7A00]"
                                      : "bg-[#CBCBCB]"
                                  }`}
                                >
                                  <svg
                                    className="w-6 h-6 text-[#ECE3DC]"
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
                                  <p className="font-semibold text-black">Pay on Spot</p>
                                  <p className="text-sm text-gray-600">
                                    Confirm booking now and pay at the salon
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "ONSPOT" && (
                                <Check className="h-5 w-5 text-[#FF7A00]" />
                              )}
                            </div>
                          </button>
                        </div>

                        {/* MB WAY Mobile Number Input */}
                        {paymentMethod === "MBWAY" && (
                          <div className="mt-4 p-4 bg-[#ECE3DC] border-2 border-[#FF7A00] rounded-lg">
                            <label className="block text-sm font-medium text-black mb-2">
                              MB WAY Mobile Number
                            </label>
                            <input
                              type="text"
                              placeholder="351#912345678"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FF7A00] focus:outline-none bg-[#ECE3DC]"
                            />
                            <p className="text-xs text-gray-600 mt-2">
                              Format: countryCode#phoneNumber (e.g., 351#912345678)
                            </p>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleConfirmClick}
                        disabled={bookingLoading}
                        className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white py-6 rounded-xl font-semibold text-lg disabled:opacity-50"
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            {paymentMethod === "ONSPOT"
                              ? "Confirming booking..."
                              : "Opening MB WAY payment..."}
                          </>
                        ) : (
                          paymentMethod === "ONSPOT"
                            ? "Confirm Booking (Pay on Spot)"
                            : "Proceed to MB WAY Payment"
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
                          className="w-full py-6 rounded-xl font-semibold text-lg border-2 border-[#1e1e1e] hover:border-[#FF7A00] hover:text-[#FFFFFF] hover:bg-[#FF7A00] bg-transparent"
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

      <AnimatePresence>
        {showMBWayPopup && mbwayPayment && mbwayBookingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#7A5C43]/35 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[#1E1E1E] bg-[#ECE3DC] shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1E1E1E]/20">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#FF6A00] font-semibold">
                    Secure Payment
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1E1E1E]">
                    Complete MB WAY Payment
                  </h3>
                </div>
                <button
                  onClick={() => setShowMBWayPopup(false)}
                  className="h-9 w-9 rounded-full border border-[#1E1E1E]/20 flex items-center justify-center text-[#1E1E1E] hover:bg-[#CBCBCB] transition-colors"
                  aria-label="Close payment popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5">
                <MBWayPaymentForm
                  payment={mbwayPayment}
                  bookingId={mbwayBookingId}
                  amount={(getTotalPrice() - offerDiscount).toFixed(2)}
                  onSuccess={() => {
                    setShowMBWayPopup(false);
                    window.location.href = `/payment-success?bookingId=${mbwayBookingId}`;
                  }}
                  onError={(error) => {
                    toast.error(error || "MB WAY payment failed");
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
