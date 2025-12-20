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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { getAddresses, createAddress, type Address } from "@/lib/api/address";
import {
  getCart,
  clearCart,
  type ApiCartItem,
  type CartResponse,
} from "@/lib/api/cart";

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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [apiCart, setApiCart] = useState<CartResponse | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Placeholder products for demo
  const placeholderProducts = [
    {
      id: "placeholder-1",
      name: "Vitamin C Brightening Face Serum",
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
      price: 679,
      quantity: 1,
      brand: "Glow Secrets",
    },
    {
      id: "placeholder-2",
      name: "Hydrating Hyaluronic Acid Moisturizer",
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400",
      price: 974,
      quantity: 2,
      brand: "AquaGlow",
    },
    {
      id: "placeholder-3",
      name: "De Fabulous Marula Oil Shampoo",
      image:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
      price: 1490,
      quantity: 1,
      brand: "De Fabulous",
    },
  ];

  // Use API cart if available (authenticated user), otherwise use CartContext, fallback to placeholder
  // This needs to be recalculated whenever apiCart or cartItems changes
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
        })
      );
      console.log("Mapped API items:", mappedItems);
      return mappedItems;
    } else if (cartItems.length > 0) {
      console.log("⚠️ Using CartContext items");
      return cartItems;
    } else {
      console.log("⚠️ Using placeholder products");
      return placeholderProducts;
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
      userToken ? `${userToken.substring(0, 20)}...` : "none"
    );
    setIsLoadingCart(true);
    try {
      const cartData = await getCart(userToken);
      console.log("✅ Cart API Response:", cartData);
      console.log(
        "📦 Full response object:",
        JSON.stringify(cartData, null, 2)
      );
      console.log(
        "Cart items count:",
        cartData?.data?.cart?.cartItems?.length || 0
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinueToPayment = async () => {
    // Validation for Step 1
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

    // Validate phone format
    if (formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

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

  const handlePlaceOrder = async () => {
    // Validation for payment
    if (paymentMethod === "card") {
      if (
        !formData.cardNumber ||
        !formData.cardName ||
        !formData.expiryDate ||
        !formData.cvv
      ) {
        toast.error("Please complete payment details");
        return;
      }
    }

    if (paymentMethod === "upi") {
      // UPI validation can be added here
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      setIsProcessing(false);
      toast.success("Order placed successfully! 🎉");

      // Clear cart
      if (token && apiCart) {
        // Clear API cart for authenticated users
        await clearCart(token);
        console.log("✅ API cart cleared");
      } else if (cartItems.length > 0) {
        // Clear CartContext for guest users
        cartItems.forEach((item) => removeFromCart(item.id));
      }

      // Redirect to confirmation or home
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 2000);
  };

  // Use API cart summary if available, otherwise use CartContext
  const totalPrice = apiCart?.data?.summary?.subtotal
    ? parseFloat(apiCart.data.summary.subtotal.toString())
    : getTotalPrice();
  const totalItems = apiCart?.data?.summary?.totalItems || getTotalItems();
  const tax = totalPrice * 0.2; // 20% VAT
  const finalTotal = totalPrice + tax;

  // Log whenever items or totals change
  useEffect(() => {
    console.log("=== Cart State Updated ===");
    console.log("Items count:", items.length);
    console.log("Items:", items);
    console.log("Total Price:", totalPrice);
    console.log("Total Items:", totalItems);
    console.log("Tax:", tax);
    console.log("Final Total:", finalTotal);
  }, [items, totalPrice, totalItems, tax, finalTotal]);

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
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Removed empty cart check to always show placeholder products

  return (
    <div className="min-h-screen bg-[#ECE3DC]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() =>
            currentStep === 1 ? router.back() : setCurrentStep(1)
          }
          className="mb-6 hover:bg-orange-50 text-[#1e1e1e] hover:text-[#1e1e1e]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? "Back to Shopping" : "Back to Details"}
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  currentStep >= 1
                    ? "bg-[#FF6A00] text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
              </div>
              <span
                className={`hidden sm:block font-medium ${
                  currentStep >= 1 ? "text-[#FF6A00]" : "text-gray-500"
                }`}
              >
                Details
              </span>
            </div>

            {/* Connector */}
            <div
              className={`h-1 w-12 sm:w-24 rounded transition-all ${
                currentStep >= 2 ? "bg-[#FF6A00]" : "bg-gray-200"
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  currentStep >= 2
                    ? "bg-[#FF6A00] text-white shadow-lg"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`hidden sm:block font-medium ${
                  currentStep >= 2 ? "text-[#FF6A00]" : "text-gray-500"
                }`}
              >
                Payment
              </span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1E1E] mb-2">
              {currentStep === 1 ? "Shipping Details" : "Payment & Review"}
            </h1>
            <p className="text-gray-600">
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
            className="max-w-3xl mx-auto"
          >
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                <CardHeader className="bg-[#ECE3DC]">
                  <CardTitle className="flex items-center gap-2 text-[#1E1E1E]">
                    <div className="p-2 bg-[#FF6A00] rounded-lg">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-[#1E1E1E] font-medium"
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
                        className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-[#1E1E1E] font-medium"
                      >
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                <CardHeader className="bg-[#ECE3DC]">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#1E1E1E]">
                      <div className="p-2 bg-[#FF6A00] rounded-lg">
                        <MapPin className="h-5 w-5 text-white" />
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
                          className="border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00] hover:text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add New
                        </Button>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  {isLoadingAddresses ? (
                    <div className="space-y-4">
                      <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />
                      <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />
                    </div>
                  ) : isAuthenticated &&
                    savedAddresses.length > 0 &&
                    !showNewAddressForm ? (
                    // Saved Addresses Selection
                    <div className="space-y-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          onClick={() => {
                            setSelectedAddressId(address.id);
                            populateFormWithAddress(address);
                          }}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? "border-[#FF6A00] bg-orange-50"
                              : "border-gray-300 hover:border-[#FF6A00]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedAddressId === address.id
                                  ? "border-[#FF6A00] bg-[#FF6A00]"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddressId === address.id && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-[#1E1E1E]">
                                  {address.fullName}
                                </p>
                                {address.isDefault && (
                                  <span className="text-xs bg-[#FF6A00] text-white px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.phone}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {address.addressLine1}
                                {address.addressLine2 &&
                                  `, ${address.addressLine2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state}{" "}
                                {address.postalCode}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // New Address Form
                    <>
                      {showNewAddressForm && savedAddresses.length > 0 && (
                        <Button
                          onClick={() => {
                            setShowNewAddressForm(false);
                            if (savedAddresses.length > 0) {
                              const defaultAddr =
                                savedAddresses.find((a) => a.isDefault) ||
                                savedAddresses[0];
                              setSelectedAddressId(defaultAddr.id);
                              populateFormWithAddress(defaultAddr);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-[#FF6A00] hover:text-orange-600 mb-2"
                        >
                          ← Back to saved addresses
                        </Button>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-[#1E1E1E] font-medium"
                          >
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-[#1E1E1E] font-medium"
                          >
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                            required
                          />
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-[#1E1E1E] font-medium"
                        >
                          Street Address *
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="123 Main Street, Apartment 4B"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                          required
                        />
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-[#1E1E1E] font-medium"
                          >
                            City *
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="London"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="state"
                            className="text-[#1E1E1E] font-medium"
                          >
                            State *
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            placeholder="England"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="pincode"
                            className="text-[#1E1E1E] font-medium"
                          >
                            Postcode *
                          </Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            placeholder="SW1A 1AA"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                            required
                          />
                        </div>
                      </div>

                      {isAuthenticated && (
                        <>
                          <Separator className="my-4" />
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
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleContinueToPayment}
                  className="bg-linear-to-r from-[#FF6A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                  size="lg"
                >
                  Continue to Payment
                  <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
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
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Payment Method */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Details Summary */}
                <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                  <CardHeader className="bg-[#ECE3DC]">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-[#1E1E1E]">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        Delivery Details
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="text-[#FF6A00] hover:text-orange-700 hover:bg-orange-50"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 bg-[#ECE3DC]">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Contact</p>
                        <p className="font-semibold text-[#1E1E1E]">
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formData.email}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formData.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Shipping To
                        </p>
                        <p className="font-semibold text-[#1E1E1E]">
                          {formData.address}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formData.city}, {formData.state} {formData.pincode}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="border-2 border-[#1E1E1E] shadow-lg bg-[#ECE3DC] overflow-hidden">
                  <CardHeader className="bg-[#ECE3DC]">
                    <CardTitle className="flex items-center gap-2 text-[#1E1E1E]">
                      <div className="p-2 bg-[#FF6A00] rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 bg-[#ECE3DC]">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <div
                        className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "card"
                            ? "border-[#FF6A00] bg-orange-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <Label
                          htmlFor="card"
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <CreditCard className="h-5 w-5" />
                          <span className="font-medium">
                            Credit / Debit Card
                          </span>
                        </Label>
                        <div className="flex gap-2">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                            alt="Visa"
                            className="h-6"
                          />
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                            alt="Mastercard"
                            className="h-6"
                          />
                        </div>
                      </div>
                      <div
                        className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "upi"
                            ? "border-[#FF6A00] bg-orange-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <RadioGroupItem value="upi" id="upi" />
                        <Label
                          htmlFor="upi"
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Wallet className="h-5 w-5" />
                          <span className="font-medium">UPI</span>
                        </Label>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Instant
                        </Badge>
                      </div>
                      <div
                        className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "cod"
                            ? "border-[#FF6A00] bg-orange-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <RadioGroupItem value="cod" id="cod" />
                        <Label
                          htmlFor="cod"
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <ShoppingBag className="h-5 w-5" />
                          <span className="font-medium">Cash on Delivery</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Card Details Form */}
                    {paymentMethod === "card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t-2"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="cardNumber"
                            className="text-[#1E1E1E] font-medium"
                          >
                            Card Number
                          </Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                            maxLength={19}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="cardName"
                            className="text-[#1E1E1E] font-medium"
                          >
                            Cardholder Name
                          </Label>
                          <Input
                            id="cardName"
                            name="cardName"
                            placeholder="John Doe"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="expiryDate"
                              className="text-[#1E1E1E] font-medium"
                            >
                              Expiry Date
                            </Label>
                            <Input
                              id="expiryDate"
                              name="expiryDate"
                              placeholder="MM/YY"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                              maxLength={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="cvv"
                              className="text-[#1E1E1E] font-medium"
                            >
                              CVV
                            </Label>
                            <Input
                              id="cvv"
                              name="cvv"
                              type="password"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === "upi" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t-2"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="upiId"
                            className="text-[#1E1E1E] font-medium"
                          >
                            UPI ID
                          </Label>
                          <Input
                            id="upiId"
                            placeholder="yourname@upi"
                            className="border-2 border-gray-300 focus:border-[#FF6A00] h-12 bg-transparent"
                          />
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 border-2 border-green-200 p-4 rounded-xl">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="font-medium">
                    Your payment information is encrypted and secure
                  </span>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card className="border-2 border-[#1E1E1E] shadow-xl bg-[#ECE3DC] overflow-hidden">
                    <CardHeader className="bg-[#ECE3DC]">
                      <CardTitle className="flex items-center gap-2 text-[#1E1E1E]">
                        <div className="p-2 bg-[#FF6A00] rounded-lg">
                          <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {/* Items List */}
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex gap-3 p-3 border-2 border-[#1E1E1E] rounded-xl bg-[#ECE3DC] hover:shadow-md transition-all"
                          >
                            <div className="relative shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#FF6A00] text-white text-xs">
                                {item.quantity}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[#1E1E1E] line-clamp-2 mb-1">
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

                      <Separator className="my-4" />

                      {/* Price Breakdown */}
                      <div className="space-y-3 bg-[#ECE3DC] p-4 rounded-xl">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            Subtotal ({totalItems}{" "}
                            {totalItems === 1 ? "item" : "items"})
                          </span>
                          <span className="font-semibold text-[#1E1E1E]">
                            £{totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 flex items-center gap-1">
                            Shipping
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          </span>
                          <span className="font-semibold text-green-600">
                            Free
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">VAT (20%)</span>
                          <span className="font-semibold text-[#1E1E1E]">
                            £{tax.toFixed(2)}
                          </span>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex justify-between items-center pt-2">
                          <div>
                            <p className="text-xs text-gray-600 mb-0.5">
                              Total Amount
                            </p>
                            <span className="text-2xl font-bold text-[#FF6A00]">
                              £{finalTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Save £{(totalPrice * 0.15).toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Place Order Button */}
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="w-full bg-linear-to-r from-[#FF6A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Lock className="h-5 w-5" />
                            <span>Complete Purchase</span>
                          </div>
                        )}
                      </Button>

                      {/* Security Info */}
                      <div className="text-center text-xs text-gray-600 flex items-center justify-center gap-1 pt-2">
                        <Lock className="h-3 w-3" />
                        256-bit SSL Secured Payment
                      </div>

                      {/* Trust Badges */}
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                        <div className="text-center">
                          <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-gray-700 font-medium">
                            Secure
                          </p>
                        </div>
                        <div className="text-center">
                          <ShoppingBag className="h-6 w-6 mx-auto text-green-600 mb-1" />
                          <p className="text-xs text-gray-700 font-medium">
                            Free Ship
                          </p>
                        </div>
                        <div className="text-center">
                          <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-1" />
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
