import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { ArrowLeft, Star, Check, User, Mail, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type BookingStep = "services" | "professional" | "time" | "confirm" | "login";

interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  category: string;
  description?: string;
}

interface Professional {
  id: string;
  name: string;
  title: string;
  rating: number;
  image: string;
  isAny?: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingFlowProps {
  onClose: () => void;
}

export function BookingFlow({ onClose }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("services");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Featured");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Sample data
  const salon = {
    name: "Studio Zee | Colombo 07",
    rating: 4.8,
    reviews: 434,
    location: "20A Guildford Crescent, Colombo",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWF1dHklMjBzYWxvbiUyMGludGVyaW9yfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080",
  };

  const serviceCategories = [
    "Featured",
    "Hair Braiding",
    "Hair Perming",
    "Children's Section",
    "Signature Spa Treatment",
    "Hair Botox Treatment",
  ];

  const services: Service[] = [
    {
      id: "1",
      name: "Women's Re-Style Cut + Wash + Blow dry",
      duration: "1 hr",
      price: 4000,
      category: "Featured",
      description: "Female only with any professional",
    },
    {
      id: "2",
      name: "B+ Bra-Strap to Midback Length",
      duration: "3 hrs, 45 mins",
      price: 28000,
      category: "Hair Braiding",
      description: "Premium braiding service",
    },
    {
      id: "3",
      name: "Aftercare for Hair Botox Treatment",
      duration: "1 hr",
      price: 4000,
      category: "Hair Botox Treatment",
      description: "Post-treatment care and styling",
    },
    {
      id: "4",
      name: "Deep Conditioner Treatment",
      duration: "2 hrs, 15 mins",
      price: 7500,
      category: "Signature Spa Treatment",
      description: "Intensive hair restoration",
    },
    {
      id: "5",
      name: "Haircut & Blow Dry",
      duration: "45 mins",
      price: 3500,
      category: "Featured",
      description: "Professional cut and style",
    },
  ];

  const professionals: Professional[] = [
    {
      id: "any",
      name: "Any professional",
      title: "for maximum availability",
      rating: 0,
      image: "",
      isAny: true,
    },
    {
      id: "1",
      name: "Minoshi",
      title: "Senior Hairdresser",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyZHJlc3NlcnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
    },
    {
      id: "2",
      name: "Maria",
      title: "Senior Hairdresser",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyZHJlc3NlcnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
    },
    {
      id: "3",
      name: "Rozanne",
      title: "Senior Hairdresser | Lecturer",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1594824846809-5a9e3e6de2cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyZHJlc3NlcnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
    },
    {
      id: "4",
      name: "Hashitha Thushara",
      title: "Senior Beautician",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyZHJlc3NlcnxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
    },
  ];

  // Generate calendar dates
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.getDate(),
        day: date.toLocaleDateString("en", { weekday: "short" }),
        fullDate: date.toISOString().split("T")[0],
        isToday: i === 0,
      });
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

  const timeSlots: TimeSlot[] = [
    { time: "11:00 am", available: true },
    { time: "11:10 am", available: true },
    { time: "11:20 am", available: true },
    { time: "11:30 am", available: true },
    { time: "11:40 am", available: false },
    { time: "11:50 am", available: true },
    { time: "12:00 pm", available: true },
    { time: "12:10 pm", available: false },
    { time: "12:20 pm", available: true },
    { time: "12:30 pm", available: true },
    { time: "12:40 pm", available: true },
    { time: "12:50 pm", available: true },
    { time: "1:00 pm", available: true },
    { time: "1:10 pm", available: false },
    { time: "1:20 pm", available: true },
    { time: "1:30 pm", available: true },
  ];

  const filteredServices = services.filter((service) =>
    selectedCategory === "Featured"
      ? service.category === "Featured"
      : service.category === selectedCategory
  );

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
      completed: selectedProfessional !== null,
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
    {
      key: "login",
      label: "Login to Book",
      active: currentStep === "login",
      completed: false,
    },
  ];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    setCurrentStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleConfirmClick = () => {
    if (isLoggedIn) {
      handleBookingConfirm();
    } else {
      setCurrentStep("login");
    }
  };

  const handleBookingConfirm = () => {
    toast.success(
      "Booking confirmed! You will receive a confirmation email shortly."
    );
    onClose();
  };

  const handleLoginAndBook = () => {
    toast.success("Redirecting to login...");
    // In a real app, this would open login modal or redirect
  };

  const handleGuestCheckout = () => {
    setIsLoggedIn(true);
    setCurrentStep("confirm");
  };

  const goBack = () => {
    if (currentStep === "professional") setCurrentStep("services");
    else if (currentStep === "time") setCurrentStep("professional");
    else if (currentStep === "confirm") setCurrentStep("time");
    else if (currentStep === "login") setCurrentStep("confirm");
  };

  // Render booking summary sidebar
  const renderBookingSummary = () => (
    <Card className="bg-white shadow-lg rounded-2xl overflow-hidden sticky top-6">
      <CardContent className="p-6">
        {/* Salon Info */}
        <div className="flex items-start space-x-3 mb-6 pb-6 border-b">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-black mb-1">{salon.name}</h3>
            <div className="flex items-center space-x-1 mb-1">
              <span className="font-medium text-sm">{salon.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(salon.rating)
                        ? "fill-[#FF7A00] text-[#FF7A00]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-xs">({salon.reviews})</span>
            </div>
            <p className="text-xs text-gray-600">{salon.location}</p>
          </div>
        </div>

        {/* Selected Service */}
        {selectedService && (
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-medium text-black mb-3 text-sm">Service</h4>
            <div>
              <p className="font-medium text-black mb-1">
                {selectedService.name}
              </p>
              <p className="text-xs text-gray-600 mb-2">
                {selectedService.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">
                  {selectedService.duration}
                </span>
                <span className="font-semibold text-black">
                  LKR {selectedService.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Professional */}
        {selectedProfessional && (
          <div className="mb-6 pb-6 border-b">
            <h4 className="font-medium text-black mb-3 text-sm">
              Professional
            </h4>
            <div className="flex items-center space-x-3">
              {selectedProfessional.isAny ? (
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
              ) : (
                <img
                  src={selectedProfessional.image}
                  alt={selectedProfessional.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-black text-sm">
                  {selectedProfessional.name}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedProfessional.title}
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
              <p className="text-sm text-gray-600">{selectedTime}</p>
            </div>
          </div>
        )}

        {/* Total */}
        {selectedService && (
          <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-black">Total</span>
              <span className="font-bold text-xl text-[#FF7A00]">
                LKR {selectedService.price.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold text-black">
                Book Appointment
              </h1>
            </div>
          </div>

          {/* Progress Breadcrumb */}
          <div className="mb-8 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-center space-x-2 text-sm flex-wrap">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full transition-colors ${
                      step.active
                        ? "bg-[#FF7A00] text-white font-medium"
                        : step.completed
                        ? "bg-green-100 text-green-700"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="mx-2 text-gray-400">→</span>
                  )}
                </div>
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
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                      <h2 className="text-2xl font-bold text-black mb-2">
                        Services
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Choose the services you'd like to book
                      </p>

                      {/* Service Categories */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {serviceCategories.map((category) => (
                          <Button
                            key={category}
                            variant={
                              selectedCategory === category
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className={`rounded-full ${
                              selectedCategory === category
                                ? "bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
                                : "text-gray-600 hover:text-white hover:border-[#FF7A00]"
                            }`}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>

                      {/* Services List */}
                      <div className="space-y-4">
                        {filteredServices.map((service) => (
                          <Card
                            key={service.id}
                            className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
                              selectedService?.id === service.id
                                ? "border-[#FF7A00] bg-orange-50"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                            onClick={() => handleServiceSelect(service)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-black mb-1">
                                  {service.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {service.description}
                                </p>
                                <div className="text-sm text-gray-500">
                                  {service.duration}
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end ml-4">
                                <div className="font-semibold text-black mb-3">
                                  LKR {service.price.toLocaleString()}
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
                                      ? "bg-[#FF7A00] hover:bg-[#FF7A00]/90"
                                      : ""
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

                      {selectedService && (
                        <Button
                          onClick={() => setCurrentStep("professional")}
                          className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white py-6 rounded-xl mt-6"
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Professional */}
                {currentStep === "professional" && (
                  <motion.div
                    key="professional"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-4 mb-6">
                        <Button
                          variant="ghost"
                          onClick={goBack}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                          <h2 className="text-2xl font-bold text-black">
                            Select professional
                          </h2>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {professionals.map((professional) => (
                          <Card
                            key={professional.id}
                            className="p-5 cursor-pointer hover:border-gray-300 transition-all duration-200 bg-white border-2 border-gray-200"
                            onClick={() =>
                              handleProfessionalSelect(professional)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                  {professional.isAny ? (
                                    <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                                      <User className="h-7 w-7 text-purple-600" />
                                    </div>
                                  ) : (
                                    <img
                                      src={professional.image}
                                      alt={professional.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-black">
                                    {professional.name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {professional.title}
                                  </p>
                                  {professional.rating > 0 && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <span className="text-sm font-medium">
                                        {professional.rating}
                                      </span>
                                      <Star className="h-4 w-4 fill-[#FF7A00] text-[#FF7A00]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00]"
                              >
                                Select
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
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
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-4 mb-6">
                        <Button
                          variant="ghost"
                          onClick={goBack}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                          <h2 className="text-2xl font-bold text-black">
                            Select time
                          </h2>
                        </div>
                      </div>

                      {/* Calendar */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-4 font-medium">
                            October 2025
                          </p>
                          <div className="grid grid-cols-7 gap-3">
                            {calendarDates.map((dateObj, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  handleDateSelect(dateObj.fullDate)
                                }
                                className={`p-4 rounded-xl text-center transition-all duration-200 ${
                                  selectedDate === dateObj.fullDate
                                    ? "bg-[#FF7A00] text-white shadow-lg scale-105"
                                    : dateObj.isToday
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100 text-gray-700 bg-white border-2 border-gray-200"
                                }`}
                                disabled={index >= 7}
                              >
                                <div className="font-bold text-lg">
                                  {dateObj.date}
                                </div>
                                <div className="text-xs mt-1">
                                  {dateObj.day}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                          <div className="space-y-4">
                            <h3 className="font-medium text-black">
                              Available times
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot.time}
                                  onClick={() =>
                                    slot.available &&
                                    handleTimeSelect(slot.time)
                                  }
                                  disabled={!slot.available}
                                  className={`p-4 text-center rounded-lg border-2 transition-all duration-200 ${
                                    selectedTime === slot.time
                                      ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00] font-semibold"
                                      : slot.available
                                      ? "border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                      : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  <div className="flex items-center justify-center">
                                    <span>{slot.time}</span>
                                    {selectedTime === slot.time && (
                                      <Check className="h-4 w-4 ml-2" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
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
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-4 mb-6">
                        <Button
                          variant="ghost"
                          onClick={goBack}
                          className="p-2 hover:bg-gray-100 rounded-full"
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

                      <Button
                        onClick={handleConfirmClick}
                        className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white py-6 rounded-xl font-semibold text-lg"
                      >
                        Confirm Appointment
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
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
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
                          className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white py-6 rounded-xl font-semibold text-lg"
                        >
                          Login / Sign up to continue
                        </Button>

                        <Button
                          onClick={handleGuestCheckout}
                          variant="outline"
                          className="w-full py-6 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-[#FF7A00] hover:text-[#FFFFFF]"
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
        </div>
      </div>
    </div>
  );
}
