"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider, useCart } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Wallet,
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  ShoppingBag,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { getAddresses, createAddress, type Address } from "@/lib/api/address";
import {
  getCart,
  clearCart,
  type ApiCartItem,
  type CartResponse,
} from "@/lib/api/cart";
import { MBWayPaymentForm } from "@/components/MBWayPaymentForm";
import { OfferSelector } from "@/components/OfferSelector";
import type { Offer } from "@/lib/types/offer";
import type { PaymentMethod, PaymentResponse } from "@/lib/types/ifthenpay";
import { isMBWayPayment } from "@/lib/types/ifthenpay";

function CheckoutContent() {
  const router = useRouter();
  const {
    items: cartItems,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    updateQuantity,
  } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentMethod] = useState<PaymentMethod>("MBWAY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [apiCart, setApiCart] = useState<CartResponse | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(
    null
  );
  const [showMBWayPopup, setShowMBWayPopup] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  // Offer state - support multiple offers
  const [selectedOffers, setSelectedOffers] = useState<
    Array<{ offer: Offer; discount: number }>
  >([]);
  const offerDiscount = selectedOffers.reduce(
    (sum, item) => sum + item.discount,
    0,
  );

  // Show toast notification when offers change (but not on initial mount)
  const [offersInitialized, setOffersInitialized] = useState(false);
  useEffect(() => {
    if (!offersInitialized) {
      setOffersInitialized(true);
      return;
    }

    const totalDiscount = selectedOffers.reduce(
      (sum, item) => sum + item.discount,
      0,
    );
    if (selectedOffers.length > 0) {
      toast.success(
        `🎉 ${selectedOffers.length} offer${selectedOffers.length > 1 ? "s" : ""} applied! You saved £${totalDiscount.toFixed(2)}`,
        { duration: 3000 },
      );
    } else if (offersInitialized) {
      toast.info("Offers removed", { duration: 2000 });
    }
  }, [selectedOffers.length]);

  // Use API cart if available (authenticated user), otherwise use CartContext
  // No fallback to placeholder products - show empty cart state instead
  const items = React.useMemo(() => {
    console.log("=== Determining Cart Items Source ===");
    console.log("API Cart exists:", !!apiCart);
    console.log("API Cart items:", apiCart?.data?.cart?.cartItems?.length || 0);
    console.log("CartContext items:", cartItems.length);

    if (
      apiCart?.data?.cart?.cartItems &&
      apiCart.data.cart.cartItems.length > 0
    ) {
      console.log("✅ Using API Cart items");
      const mappedItems = apiCart.data.cart.cartItems.map(
        (item: ApiCartItem) => ({
          id: item.productId,
          name: item.product.title,
          price: parseFloat(item.product.price),
          quantity: item.quantity,
          image:
            item.product.images[0] ||
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
          brand: "",
          salonId: item.product.salonId, // Keep salonId for validation
        }),
      );
      console.log("Mapped API items:", mappedItems);
      return mappedItems;
    } else if (cartItems.length > 0) {
      console.log("⚠️ Using CartContext items");
      return cartItems;
    } else {
      console.log("⚠️ Cart is empty");
      return [];
    }
  }, [apiCart, cartItems]);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveAddress: false,
    notes: "",
  });

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        console.log("=== Checkout Auth Check ===");
        console.log("Access token:", accessToken ? "exists" : "missing");
        console.log("User data:", userStr ? "exists" : "missing");

        if (accessToken && userStr) {
          const user = JSON.parse(userStr);
          console.log("User object:", user);

          setToken(accessToken);
          setIsAuthenticated(true);
          setFormData((prev) => ({ ...prev, email: user.email || "" }));
          loadAddresses(accessToken);
          loadCartFromAPI(accessToken);
          console.log("✅ User authenticated successfully");
          return;
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
      }

      console.log("⚠️ User not authenticated, will show auth modal");
      setIsAuthenticated(false);
      setShowAuthModal(true);
    };

    checkAuth();
  }, []);

  // Load cart from API
  const loadCartFromAPI = async (userToken: string) => {
    console.log("=== Loading Cart from API ===");
    console.log(
      "Token:",
      userToken ? `${userToken.substring(0, 20)}...` : "none",
    );
    setIsLoadingCart(true);
    try {
      const cartData = await getCart(userToken);
      console.log("✅ Cart API Response:", cartData);
      console.log(
        "📦 Full response object:",
        JSON.stringify(cartData, null, 2),
      );
      console.log(
        "Cart items count:",
        cartData?.data?.cart?.cartItems?.length || 0,
      );
      console.log("Cart summary:", cartData?.data?.summary);

      // Detailed check
      if (!cartData) {
        console.warn("⚠️ cartData is null or undefined");
      } else if (!cartData.data) {
        console.warn("⚠️ cartData.data is missing");
      } else if (!cartData.data.cart) {
        console.warn("⚠️ cartData.data.cart is missing");
      } else if (!cartData.data.cart.cartItems) {
        console.warn("⚠️ cartData.data.cart.cartItems is missing");
      } else if (cartData.data.cart.cartItems.length === 0) {
        console.warn("⚠️ cartData.data.cart.cartItems is empty array");
      } else {
        console.log("✅ Cart has items:", cartData.data.cart.cartItems);
      }

      setApiCart(cartData);
    } catch (error) {
      console.error("❌ Failed to load cart:", error);
      setApiCart(null);
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Load saved addresses
  const loadAddresses = async (userToken: string) => {
    setIsLoadingAddresses(true);
    try {
      const addresses = await getAddresses(userToken);
      setSavedAddresses(addresses);

      // Auto-select default address or first address
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        populateFormWithAddress(defaultAddress);
      } else if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id);
        populateFormWithAddress(addresses[0]);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      setShowNewAddressForm(true);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Populate form with selected address
  const populateFormWithAddress = (address: Address) => {
    const names = address.fullName.split(" ");
    setFormData((prev) => ({
      ...prev,
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",
      phone: address.phone,
      address: address.addressLine1,
      city: address.city,
      state: address.state,
      pincode: address.postalCode,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "phone") {
      const cleanedValue = e.target.value.replace(/\D/g, "").slice(0, 14);
      setFormData({
        ...formData,
        phone: cleanedValue,
      });

      if (cleanedValue.length === 0) {
        setPhoneError("Phone number is required");
      } else if (!/^\d{9,14}$/.test(cleanedValue)) {
        setPhoneError("Phone number must be 9 to 14 digits");
      } else {
        setPhoneError("");
      }
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinueToPayment = async () => {
    // If user has selected a saved address (not creating a new one)
    if (selectedAddressId && !showNewAddressForm && savedAddresses.length > 0) {
      // Just validate that an address is selected, skip form validation
      console.log("Using saved address:", selectedAddressId);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validation for Step 1 - Only when creating a new address
    if (
      !formData.email ||
      !formData.phone ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone format (9 to 14 digits)
    if (!/^\d{9,14}$/.test(formData.phone)) {
      setPhoneError("Phone number must be 9 to 14 digits");
      toast.error("Phone number must be 9 to 14 digits");
      return;
    }
    setPhoneError("");

    // Save address if checkbox is checked and user is authenticated
    if (formData.saveAddress && token && isAuthenticated) {
      try {
        console.log("Saving new address...");
        const newAddress = await createAddress(token, {
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: "United Kingdom",
          isDefault: savedAddresses.length === 0,
        });
        setSavedAddresses([...savedAddresses, newAddress]);
        setSelectedAddressId(newAddress.id); // Auto-select the newly created address
        console.log("✅ Address saved successfully:", newAddress);
        toast.success("Address saved successfully!");
      } catch (error) {
        console.error("❌ Failed to save address:", error);
        toast.error("Failed to save address, but continuing with checkout");
      }
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInitiateCheckout = async () => {
    // Ensure user is authenticated
    if (!token || !isAuthenticated) {
      toast.error("Please log in to place an order");
      setShowAuthModal(true);
      return;
    }

    // Ensure address is selected
    if (!selectedAddressId) {
      toast.error("Please select or add a delivery address");
      setCurrentStep(1);
      return;
    }

    // Validate mobile number for MBWAY
    if (selectedPaymentMethod === "MBWAY") {
      if (!mobileNumber) {
        toast.error("Please enter your mobile number for MB WAY payment");
        return;
      }
      
      // Validate format: countryCode#phoneNumber (e.g., 351#912345678)
      const mbwayFormatRegex = /^\d{1,3}#\d{9,15}$/;
      if (!mbwayFormatRegex.test(mobileNumber)) {
        toast.error(
          "Invalid MB WAY number format. Please use: countryCode#phoneNumber (e.g., 351#912345678)",
          { duration: 5000 }
        );
        return;
      }
    }

    // Validate cart doesn't contain items from multiple salons
    if (
      apiCart?.data?.cart?.cartItems &&
      apiCart.data.cart.cartItems.length > 0
    ) {
      const salonIds = new Set(
        apiCart.data.cart.cartItems.map(
          (item: ApiCartItem) => item.product.salonId,
        ),
      );

      console.log("=== FRONTEND SALON VALIDATION ===");
      console.log(
        "Number of items in cart:",
        apiCart.data.cart.cartItems.length,
      );
      console.log("Unique salon IDs:", Array.from(salonIds));
      console.log("Number of unique salons:", salonIds.size);
      console.log(
        "Cart items with salon info:",
        apiCart.data.cart.cartItems.map((item: ApiCartItem) => ({
          productId: item.productId,
          title: item.product.title,
          salonId: item.product.salonId,
        })),
      );
    }

    setIsProcessing(true);

    try {
      // Create checkout session and order with PAYMENT_PENDING status
      console.log("=== CREATING CHECKOUT SESSION ===");
      console.log("Address ID:", selectedAddressId);
      console.log("Payment Method:", selectedPaymentMethod);
      console.log("Notes:", formData.notes || "(none)");

      const requestBody: any = {
        addressId: selectedAddressId,
        notes: formData.notes || undefined,
        paymentMethod: selectedPaymentMethod,
      };

      // Add mobile number for MBWAY
      if (selectedPaymentMethod === "MBWAY" && mobileNumber) {
        console.log("📱 Adding mobile number for MBWAY:", mobileNumber);
        requestBody.mobileNumber = mobileNumber;
      }

      console.log("📤 REQUEST BODY BEING SENT:", JSON.stringify(requestBody, null, 2));

      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log("=== CHECKOUT API RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
      console.log("Response data:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("❌ Backend/Proxy returned error:", data.message);
        console.error("❌ Full error response:", data);
        console.error("❌ Error details:", data.errors || data.details || data.error);
        const detailedError =
          data.error ||
          data.details?.error ||
          data.details?.message ||
          data.message;
        // Handle specific error cases with helpful messages
        if (data.message?.includes("multiple salons")) {
          console.error(
            "❌ BACKEND VALIDATION says multiple salons - this is a BACKEND issue!",
          );
          toast.error(
            "Your cart contains items from multiple salons. Please remove items from other salons before proceeding.",
            {
              duration: 5000,
            },
          );
        } else if (data.message?.includes("Cart is empty")) {
          toast.error("Your cart is empty. Please add items before checkout.");
          router.push("/products");
        } else if (data.message?.includes("Insufficient stock")) {
          toast.error(
            data.message ||
              "Some items are out of stock. Please update your cart.",
            {
              duration: 5000,
            },
          );
        } else {
          throw new Error(
            detailedError || "Failed to create checkout session",
          );
        }
        setIsProcessing(false);
        return;
      }

      console.log("✅ Checkout session created:", data);
      console.log("=== PAYMENT METHOD DETECTION ===");
      console.log("Selected payment method:", selectedPaymentMethod);
      console.log("Has clientSecret?", !!data.data.clientSecret);
      console.log("Has payment object?", !!data.data.payment);
      console.log("Payment object:", data.data.payment);

      // Set order ID
      setOrderId(data.data.order.id);

      // Handle different payment methods
      if (data.data.payment) {
        // If-Then Pay payment
        console.log("📝 Setting up IF-THEN PAY payment");
        console.log("Payment provider:", data.data.payment.provider);
        console.log("Payment method:", data.data.payment.method);
        console.log("Is MBWAY?", isMBWayPayment(data.data.payment));
        setPaymentResponse(data.data.payment);
        if (isMBWayPayment(data.data.payment)) {
          setShowMBWayPopup(true);
        }
        setClientSecret(null);
        setPaymentIntentId(null);
      } else {
        console.error("❌ No MB WAY payment data received from backend!");
        throw new Error("MB WAY payment initialization failed");
      }

      setIsProcessing(false);

      toast.success(
        "Ready for payment! Complete payment below to confirm your order.",
        {
          duration: 5000,
        },
      );
    } catch (error: any) {
      console.error("❌ Failed to create checkout session:", error);
      toast.error(
        error.message || "Failed to initiate checkout. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  // Use API cart summary if available, otherwise use CartContext
  const totalPrice = apiCart?.data?.summary?.subtotal
    ? parseFloat(apiCart.data.summary.subtotal.toString())
    : getTotalPrice();
  const totalItems = apiCart?.data?.summary?.totalItems || getTotalItems();
  const finalTotal = totalPrice - offerDiscount; // Apply offer discount

  // Log whenever items or totals change
  useEffect(() => {
    console.log("=== Cart State Updated ===");
    console.log("Items count:", items.length);
    console.log("Items:", items);
    console.log("Total Price:", totalPrice);
    console.log("Total Items:", totalItems);
    console.log("Final Total:", finalTotal);
  }, [items, totalPrice, totalItems, finalTotal]);

  // Expose reload function to window for manual testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).reloadCart = () => {
        if (token) {
          console.log("Manually reloading cart...");
          loadCartFromAPI(token);
        } else {
          console.log("No token available. Please log in first.");
        }
      };
    }
  }, [token]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show empty cart state if no items
  if (items.length === 0 && !isLoadingCart) {
    return (
      <div className="min-h-screen bg-[#ECE3DC]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-32 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-[#1E1E1E] shadow-xl bg-[#ECE3DC]">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-[#FF6A00]" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-3">
                  Your Cart is Empty
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. Start
                  shopping to find amazing beauty products!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/products")}
                    className="bg-gradient-to-r from-[#FF6A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Browse Products
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    className="border-2 border-[#1E1E1E] text-[#1E1E1E] hover:bg-[#1E1E1E] hover:text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold transition-all"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECE3DC]">
      <Header />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 pb-10 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() =>
            currentStep === 1 ? router.back() : setCurrentStep(1)
          }
          className="mb-4 sm:mb-6 hover:bg-orange-50 text-[#1e1e1e] hover:text-[#1e1e1e] h-10 sm:h-11"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">
            {currentStep === 1 ? "Back to Shopping" : "Back to Details"}
          </span>
        </Button>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            {/* Step 1 */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-all ${
                  currentStep >= 1
                    ? "bg-[#FF6A00] text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : "1"}
              </div>
              <span
                className={`text-xs sm:text-base font-medium ${
                  currentStep >= 1 ? "text-[#FF6A00]" : "text-gray-500"
                }`}
              >
                Details
              </span>
            </div>

            {/* Connector */}
            <div
              className={`h-1 w-8 sm:w-12 md:w-24 rounded transition-all ${
                currentStep >= 2 ? "bg-[#FF6A00]" : "bg-gray-200"
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-all ${
                  currentStep >= 2
                    ? "bg-[#FF6A00] text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs sm:text-base font-medium ${
                  currentStep >= 2 ? "text-[#FF6A00]" : "text-gray-500"
                }`}
              >
                Payment
              </span>
            </div>
          </div>

          <div className="text-center px-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-2">
              {currentStep === 1 ? "Shipping Details" : "Payment & Review"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {currentStep === 1
                ? "Enter your contact and shipping information"
                : "Review your order and complete payment"}
            </p>
          </div>
        </div>

        {/* STEP 1: Details Form */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Contact Information */}
              <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                <CardHeader className="bg-[#ECE3DC] p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-[#1E1E1E] text-base sm:text-lg">
                    <div className="p-2 bg-[#FF6A00] rounded-lg">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                      >
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                      >
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="9 to 14 digits"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`border-2 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base ${
                          phoneError ? "border-red-400" : "border-gray-300"
                        }`}
                        maxLength={14}
                        required
                      />
                      {phoneError && (
                        <p className="text-xs text-red-600">{phoneError}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                <CardHeader className="bg-[#ECE3DC] p-4 sm:p-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-[#1E1E1E] text-base sm:text-lg">
                      <div className="p-2 bg-[#FF6A00] rounded-lg">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      Shipping Address
                    </div>
                    {isAuthenticated &&
                      savedAddresses.length > 0 &&
                      !showNewAddressForm && (
                        <Button
                          onClick={() => setShowNewAddressForm(true)}
                          variant="outline"
                          size="sm"
                          className="border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white h-9 text-sm self-start sm:self-auto"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Add New
                        </Button>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 space-y-4 sm:space-y-5">
                  {isLoadingAddresses ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="h-20 sm:h-24 bg-gray-200 animate-pulse rounded-lg" />
                      <div className="h-20 sm:h-24 bg-gray-200 animate-pulse rounded-lg" />
                    </div>
                  ) : isAuthenticated && savedAddresses.length > 0 && !showNewAddressForm ? (
                    <div className="space-y-3 sm:space-y-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          onClick={() => {
                            setSelectedAddressId(address.id);
                            populateFormWithAddress(address);
                          }}
                          className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all active:scale-98 ${
                            selectedAddressId === address.id
                              ? "border-[#FF6A00] bg-orange-50"
                              : "border-gray-300 hover:border-[#FF6A00] bg-[#ECE3DC]"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-[#1E1E1E] text-sm sm:text-base">
                                  {address.fullName}
                                </p>
                                {address.isDefault && (
                                  <Badge className="bg-[#FF6A00] text-white text-xs px-2 py-0.5">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-700 mb-1">
                                {address.addressLine1}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-700">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                            </div>
                            {selectedAddressId === address.id && (
                              <CheckCircle2 className="h-5 w-5 text-[#FF6A00] shrink-0 mt-0.5" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {showNewAddressForm && savedAddresses.length > 0 && (
                        <Button
                          onClick={() => {
                            setShowNewAddressForm(false);
                            if (savedAddresses.length > 0) {
                              const defaultAddr =
                                savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                              setSelectedAddressId(defaultAddr.id);
                              populateFormWithAddress(defaultAddr);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-[#FF6A00] hover:text-orange-600 mb-2 h-9 p-2"
                        >
                          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-sm">Back to saved addresses</span>
                        </Button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                          >
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                          >
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <Separator className="my-3 sm:my-4" />

                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                        >
                          Street Address *
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="123 Main Street, Apartment 4B"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base"
                          required
                        />
                      </div>

                      <Separator className="my-3 sm:my-4" />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                          >
                            City *
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="London"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="state"
                            className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                          >
                            State *
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            placeholder="England"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="pincode"
                            className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                          >
                            Postcode *
                          </Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            placeholder="SW1A 1AA"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-transparent text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-3 sm:mt-4">
                        <Label
                          htmlFor="notes"
                          className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                        >
                          Delivery Instructions (Optional)
                        </Label>
                        <textarea
                          id="notes"
                          name="notes"
                          placeholder="e.g., Please deliver between 2-5 PM, Ring doorbell twice"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notes: e.target.value,
                            })
                          }
                          rows={3}
                          maxLength={500}
                          className="w-full px-3 py-3 border-2 border-gray-300 focus:border-[#FF6A00] rounded-md bg-transparent text-sm sm:text-base resize-none focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 text-right">
                          {formData.notes.length}/500 characters
                        </p>
                      </div>

                      {isAuthenticated && (
                        <>
                          <Separator className="my-3 sm:my-4" />
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="saveAddress"
                              checked={formData.saveAddress}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  saveAddress: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-[#FF6A00] border-gray-300 rounded focus:ring-[#FF6A00]"
                            />
                            <Label
                              htmlFor="saveAddress"
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              Save this address for future orders
                            </Label>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Continue Button */}
              <div className="flex justify-center pt-4 sm:pt-6">
                <Button
                  onClick={handleContinueToPayment}
                  className="bg-gradient-to-r from-[#FF6A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all active:scale-98"
                  size="lg"
                >
                  <span>Continue to Payment</span>
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Payment & Review */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left: Payment Method */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
                {/* Delivery Details Summary */}
                <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                  <CardHeader className="bg-[#ECE3DC] p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-[#1E1E1E] text-base sm:text-lg">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        Delivery Details
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="text-[#FF6A00] hover:text-orange-700 hover:bg-orange-50 self-start sm:self-auto h-9"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 bg-[#ECE3DC]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Contact</p>
                        <p className="font-semibold text-[#1E1E1E] text-sm sm:text-base">
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 break-all">
                          {formData.email}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700">
                          {formData.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Shipping To
                        </p>
                        <p className="font-semibold text-[#1E1E1E] text-sm sm:text-base">
                          {formData.address}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700">
                          {formData.city}, {formData.state} {formData.pincode}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                  <CardHeader className="bg-[#ECE3DC] p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-[#1E1E1E] text-base sm:text-lg">
                      <div className="p-2 bg-[#FF6A00] rounded-lg">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 space-y-4 bg-[#ECE3DC]">
                    {!paymentResponse ? (
                      <>
                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                          <Label className="text-[#1E1E1E] font-semibold text-sm sm:text-base">
                            MB WAY Payment
                          </Label>
                          <div className="flex items-start space-x-3 p-3 sm:p-4 border-2 border-[#FF6A00] bg-[#ECE3DC] rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <Label className="font-semibold text-[#1E1E1E] flex items-center gap-2 text-sm sm:text-base">
                                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF6A00] shrink-0" />
                                <span>MB WAY</span>
                              </Label>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Pay instantly via your MB WAY mobile app
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="mbway-mobile"
                            className="text-[#1E1E1E] font-medium text-sm sm:text-base"
                          >
                            MB WAY Mobile Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="mbway-mobile"
                            type="text"
                            placeholder="351#912345678"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-11 sm:h-12 bg-[#ECE3DC] text-sm sm:text-base font-mono"
                            required
                          />
                          <p className="text-xs text-gray-600">
                            Format: <span className="font-mono font-medium">countryCode#phoneNumber</span> (e.g., 351#912345678)
                          </p>
                        </div>

                        <div className="text-center py-6 sm:py-8">
                          <p className="text-sm sm:text-base text-gray-600 mb-4">
                            Click "Proceed to Payment" button below to initialize
                            secure payment
                          </p>
                          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Powered by If-Then Pay</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Payment Pending Warning */}
                        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5">
                              <svg
                                className="h-5 w-5 text-amber-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-amber-900 mb-1">
                                Payment Required to Complete Order
                              </h4>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                Your order is being prepared for payment.{" "}
                                <strong>
                                  Complete the payment below to confirm your
                                  order.
                                </strong>{" "}
                                If you leave this page without paying, your
                                order will NOT be placed and items will remain
                                in your cart.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Render appropriate payment form */}
                        {(() => {
                          console.log("=== PAYMENT FORM RENDERING ===");
                          console.log("clientSecret exists?", !!clientSecret);
                          console.log("paymentResponse exists?", !!paymentResponse);
                          if (paymentResponse) {
                            console.log("paymentResponse.provider:", paymentResponse.provider);
                            console.log("paymentResponse.method:", (paymentResponse as any).method);
                            console.log("Is MBWAY?", isMBWayPayment(paymentResponse));
                          }
                          return null;
                        })()}
                        
                        {paymentResponse && isMBWayPayment(paymentResponse) && (
                          <div className="rounded-xl border-2 border-[#1E1E1E] bg-[#ECE3DC] p-4 sm:p-5 text-center space-y-3">
                            <p className="text-sm sm:text-base text-[#1E1E1E] font-medium">
                              MB WAY payment is ready.
                            </p>
                            <Button
                              onClick={() => setShowMBWayPopup(true)}
                              className="bg-[#FF6A00] hover:bg-orange-600 text-white"
                            >
                              Resume MB WAY Payment
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Card Details Form - Now handled by payment forms */}
                  </CardContent>
                </Card>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-[#ECE3DC] border-2 border-[#1E1E1E]/20 p-4 rounded-xl">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="font-medium">
                    Your payment information is encrypted and secure
                  </span>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="lg:sticky lg:top-24">
                  <Card className="border-2 border-[#1E1E1E] shadow-xl bg-[#ECE3DC] overflow-hidden">
                    <CardHeader className="bg-[#ECE3DC] p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-[#1E1E1E] text-base sm:text-lg">
                        <div className="p-2 bg-[#FF6A00] rounded-lg">
                          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6 space-y-3 sm:space-y-4">
                      {/* Items List */}
                      <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                        {items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex gap-2 sm:gap-3 p-2 sm:p-3 border-2 border-[#1E1E1E] rounded-lg sm:rounded-xl bg-[#ECE3DC] hover:shadow-md transition-all"
                          >
                            <div className="relative shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-md sm:rounded-lg object-cover"
                              />
                              <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-[#FF6A00] text-white text-xs">
                                {item.quantity}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-[#1E1E1E] line-clamp-2 mb-1">
                                {item.name}
                              </h4>
                              {item.brand && (
                                <p className="text-xs text-[#FF6A00] font-medium mb-1">
                                  {item.brand}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-600">
                                  £{item.price} × {item.quantity}
                                </p>
                                <p className="text-sm font-bold text-[#1E1E1E]">
                                  £{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-3 sm:my-4" />

                      {/* Offer Selector - Only show if there are items */}
                      {items.length > 0 && (
                        <OfferSelector
                          cartItems={items}
                          amount={totalPrice}
                          onOffersApplied={(offers) => {
                            setSelectedOffers(offers);
                          }}
                          selectedOffers={selectedOffers}
                        />
                      )}

                      <Separator className="my-3 sm:my-4" />

                      {/* Price Breakdown */}
                      <div className="space-y-2 sm:space-y-3 bg-[#ECE3DC] p-3 sm:p-4 rounded-lg sm:rounded-xl">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            Subtotal ({totalItems}{" "}
                            {totalItems === 1 ? "item" : "items"})
                          </span>
                          <span className="font-semibold text-[#1E1E1E]">
                            £{totalPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Offer Discount */}
                        {offerDiscount > 0 && (
                          <div className="space-y-1">
                            {selectedOffers.map(({ offer, discount }) => (
                              <div
                                key={offer.id}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-green-700 font-medium flex items-center gap-1">
                                  <Badge className="bg-gradient-to-r from-[#F44A01] to-[#FF6A00] text-white text-xs px-2 py-0.5">
                                    {offer.title}
                                  </Badge>
                                </span>
                                <span className="font-semibold text-green-600">
                                  -£{discount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                            {selectedOffers.length > 1 && (
                              <div className="flex justify-between text-sm pt-1 border-t border-green-200">
                                <span className="text-green-800 font-bold">
                                  Total Discount
                                </span>
                                <span className="font-bold text-green-600">
                                  -£{offerDiscount.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 flex items-center gap-1">
                            Shipping
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          </span>
                          <span className="font-semibold text-green-600">
                            Free
                          </span>
                        </div>

                        <Separator className="my-2 sm:my-3" />

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">
                              Total Amount
                            </p>
                            <span className="text-xl sm:text-2xl font-bold text-[#FF6A00]">
                              £{(totalPrice - offerDiscount).toFixed(2)}
                            </span>
                          </div>
                          <div className="sm:text-right">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs sm:text-sm">
                              Save £
                              {(offerDiscount + totalPrice * 0.15).toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Place Order Button */}
                      <Button
                        onClick={handleInitiateCheckout}
                        disabled={
                          isProcessing || !!clientSecret || !!paymentResponse
                        }
                        className="w-full bg-gradient-to-r from-[#FF6A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-5 sm:py-6 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all active:scale-98"
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm sm:text-base">Processing...</span>
                          </div>
                        ) : clientSecret || paymentResponse ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Proceed to Payment Below</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Proceed to Payment</span>
                          </div>
                        )}
                      </Button>

                      {/* Security Info */}
                      <div className="text-center text-xs text-gray-600 flex items-center justify-center gap-1 pt-2">
                        <Lock className="h-3 w-3" />
                        256-bit SSL Secured Payment
                      </div>

                      {/* Trust Badges */}
                      <div className="grid grid-cols-3 gap-2 pt-3 sm:pt-4 border-t">
                        <div className="text-center">
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-gray-700 font-medium">
                            Secure
                          </p>
                        </div>
                        <div className="text-center">
                          <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-gray-700 font-medium">
                            Free Ship
                          </p>
                        </div>
                        <div className="text-center">
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-gray-700 font-medium">
                            Returns
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          // Check if user logged in while modal was open
          const accessToken = localStorage.getItem("accessToken");
          const userStr = localStorage.getItem("user");

          if (accessToken && userStr) {
            try {
              const user = JSON.parse(userStr);
              setToken(accessToken);
              setIsAuthenticated(true);
              setFormData((prev) => ({ ...prev, email: user.email || "" }));
              loadAddresses(accessToken);
              loadCartFromAPI(accessToken);
              setShowAuthModal(false);
              console.log("✅ User logged in, modal closed");
              return;
            } catch (error) {
              console.error("Error loading user after login:", error);
            }
          }
          // If user closed modal without logging in, redirect to home
          console.log("⚠️ User closed modal without logging in, redirecting");
          toast.error("Please log in to continue with checkout");
          router.push("/");
        }}
      />

      <AnimatePresence>
        {showMBWayPopup && paymentResponse && isMBWayPayment(paymentResponse) && (
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
                  payment={paymentResponse}
                  orderId={orderId || undefined}
                  amount={finalTotal}
                  onSuccess={() => {
                    setShowMBWayPopup(false);
                    const returnUrl = `${window.location.origin}/payment-success?orderId=${orderId}`;
                    window.location.href = returnUrl;
                  }}
                  onError={(error) => {
                    console.error("MB WAY payment error:", error);
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

export default function CheckoutPage() {
  return (
    <CartProvider>
      <WishlistProvider>
        <CheckoutContent />
      </WishlistProvider>
    </CartProvider>
  );
}
