"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider, useCart } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
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
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

function CheckoutContent() {
  const router = useRouter();
  const {
    items: cartItems,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    updateQuantity,
  } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Use cart items if available, otherwise use placeholder
  const items = cartItems.length > 0 ? cartItems : placeholderProducts;

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
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (
      !formData.email ||
      !formData.phone ||
      !formData.firstName ||
      !formData.address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

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

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Order placed successfully! 🎉");

      // Clear cart (only if using real cart items)
      if (cartItems.length > 0) {
        cartItems.forEach((item) => removeFromCart(item.id));
      }

      // Redirect to confirmation or home
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 2000);
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const tax = totalPrice * 0.18; // 18% GST
  const finalTotal = totalPrice + tax;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Removed empty cart check to always show placeholder products

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-orange-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shopping
        </Button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-orange-500" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main Street, Apartment 4B"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Chennai"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="Tamil Nadu"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="600001"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Credit / Debit Card</span>
                      </Label>
                      <div className="flex gap-1">
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
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
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
                        className="bg-green-50 text-green-700"
                      >
                        Instant
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
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
                      className="space-y-4 pt-4 border-t"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          maxLength={19}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            type="password"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
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
                      className="space-y-4 pt-4 border-t"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input id="upiId" placeholder="yourname@upi" />
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <Lock className="h-4 w-4 text-green-600" />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-24"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-orange-500" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items List */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-md object-cover border"
                          />
                          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-orange-500 text-white">
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                            {item.name}
                          </h4>
                          {item.brand && (
                            <p className="text-xs text-orange-600 font-medium mb-1">
                              {item.brand}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              ₹{item.price} × {item.quantity}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Promo Code */}
                  {/* <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Use code{" "}
                      <span className="font-bold text-orange-600">FIRST20</span>{" "}
                      for 20% off
                    </p>
                  </div> */}

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Subtotal ({totalItems}{" "}
                        {totalItems === 1 ? "item" : "items"})
                      </span>
                      <span className="font-medium">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        Shipping
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <span className="text-xl font-bold text-gray-900">
                          ₹{finalTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600 font-medium">
                          You save ₹{(totalPrice * 0.15).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Place Secure Order</span>
                        <span className="ml-1">₹{finalTotal.toFixed(2)}</span>
                      </div>
                    )}
                  </Button>

                  {/* Payment Security Info */}
                  <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" />
                    Secured by SSL encryption
                  </p>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div className="text-center">
                      <CheckCircle2 className="h-5 w-5 mx-auto text-green-600 mb-1" />
                      <p className="text-xs text-gray-600">Secure</p>
                    </div>
                    <div className="text-center">
                      <ShoppingBag className="h-5 w-5 mx-auto text-green-600 mb-1" />
                      <p className="text-xs text-gray-600">Free Shipping</p>
                    </div>
                    <div className="text-center">
                      <CheckCircle2 className="h-5 w-5 mx-auto text-green-600 mb-1" />
                      <p className="text-xs text-gray-600">Easy Returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
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
