"use client";

import { useEffect, useState } from "react";
import { getUser, isAuthenticated } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { Toaster } from "@/components/Toaster";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Heart,
  ShoppingBag,
  Clock,
  Award,
  Star,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "appointments" | "orders" | "wishlist" | "settings"
  >("overview");
  const [appointmentFilter, setAppointmentFilter] = useState<
    "upcoming" | "past" | "cancelled"
  >("upcoming");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      if (!isAuthenticated()) {
        router.replace("/");
        return;
      }

      const userData = getUser();
      if (!userData) {
        router.replace("/");
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
          <Header />

          {/* Hero Section with Cover */}
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 sm:h-64 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
            </div>

            {/* Profile Card - Overlapping */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
              <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 p-1">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <span className="text-5xl font-bold bg-gradient-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-all hover:scale-110">
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {user.name}
                          </h1>
                          <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                              {user.role === "customer"
                                ? "Customer"
                                : "Salon Owner"}
                            </Badge>
                            {user.isVerified && (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => setActiveTab("settings")}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            0
                          </div>
                          <div className="text-sm text-gray-600">Orders</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            0
                          </div>
                          <div className="text-sm text-gray-600">Wishlist</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            0
                          </div>
                          <div className="text-sm text-gray-600">Reviews</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="mt-8 flex gap-2 border-b border-gray-200 overflow-x-scroll">
                {[
                  { key: "overview", label: "Overview", icon: User },
                  {
                    key: "appointments",
                    label: "Appointments",
                    icon: Calendar,
                  },
                  { key: "orders", label: "My Orders", icon: ShoppingBag },
                  { key: "wishlist", label: "Wishlist", icon: Heart },
                  { key: "settings", label: "Settings", icon: Edit },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-8 mb-16">
                {activeTab === "overview" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Your Appointments - Preview */}
                    <Card className="hover:shadow-lg transition-shadow md:col-span-2">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            Your Appointments
                          </h3>
                          <Button
                            onClick={() => setActiveTab("appointments")}
                            variant="ghost"
                            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                          >
                            View All
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No upcoming appointments</p>
                            <Button
                              onClick={() => (window.location.href = "/#book")}
                              className="mt-4 bg-orange-500 hover:bg-orange-600"
                            >
                              Book Appointment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="hover:shadow-lg transition-shadow md:col-span-2">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          Recent Activity
                        </h3>
                        <div className="space-y-4">
                          <div className="text-center py-8 text-gray-500">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No recent activity</p>
                            <Button
                              onClick={() => (window.location.href = "/#shop")}
                              className="mt-4 bg-orange-500 hover:bg-orange-600"
                            >
                              Start Shopping
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rewards & Points */}

                    {/* Favorite Salons */}
                    <Card className="hover:shadow-lg transition-shadow md:col-span-2">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Star className="h-5 w-5 text-orange-500" />
                          Favorite Salons
                        </h3>
                        <div className="text-center py-8 text-gray-500">
                          <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>You haven't added any favorite salons yet</p>
                          <Button
                            onClick={() => (window.location.href = "/#book")}
                            className="mt-4 bg-orange-500 hover:bg-orange-600"
                          >
                            Explore Salons
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "appointments" && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Your Appointments
                      </h2>
                      <Button
                        onClick={() => (window.location.href = "/#book")}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book New
                      </Button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                      {[
                        {
                          key: "upcoming" as const,
                          label: "Upcoming",
                          count: 2,
                        },
                        { key: "past" as const, label: "Past", count: 5 },
                        {
                          key: "cancelled" as const,
                          label: "Cancelled",
                          count: 1,
                        },
                      ].map((filter) => (
                        <button
                          key={filter.key}
                          onClick={() => setAppointmentFilter(filter.key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            appointmentFilter === filter.key
                              ? "bg-orange-500 text-white"
                              : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                          }`}
                        >
                          {filter.label}
                          <span className="ml-2 text-xs opacity-75">
                            ({filter.count})
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Appointments Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Appointment Card 1 - Upcoming */}
                      {appointmentFilter === "upcoming" && (
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Salon Image */}
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img
                                  src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400"
                                  alt="Salon"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Appointment Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      Vurve Salon
                                    </h4>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        Nungambakkam
                                      </span>
                                    </p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs flex-shrink-0">
                                    Confirmed
                                  </Badge>
                                </div>

                                <div className="space-y-1 text-sm mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                                    <span className="font-medium">
                                      Tomorrow, Nov 27
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>3:00 PM - 4:30 PM</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    Hair Styling
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Color
                                  </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 flex-1"
                                  >
                                    Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Appointment Card 2 - Upcoming */}
                      {appointmentFilter === "upcoming" && (
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Salon Image */}
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img
                                  src="https://images.unsplash.com/photo-1633681926035-ec90e342ced9?w=400"
                                  alt="Salon"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Appointment Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      Glam Studio Pro
                                    </h4>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">T. Nagar</span>
                                    </p>
                                  </div>
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs flex-shrink-0">
                                    Pending
                                  </Badge>
                                </div>

                                <div className="space-y-1 text-sm mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                                    <span className="font-medium">
                                      Dec 2, 2025
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>11:00 AM - 1:00 PM</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    Bridal Makeup
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Pre-Wedding
                                  </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 flex-1"
                                  >
                                    Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 flex-1"
                                  >
                                    Reschedule
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Past Appointment Card */}
                      {appointmentFilter === "past" && (
                        <Card className="hover:shadow-lg transition-shadow opacity-60 hover:opacity-100">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Salon Image */}
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img
                                  src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400"
                                  alt="Salon"
                                  className="w-full h-full object-cover grayscale"
                                />
                              </div>

                              {/* Appointment Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      Zen Wellness Spa
                                    </h4>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">Adyar</span>
                                    </p>
                                  </div>
                                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs flex-shrink-0">
                                    Completed
                                  </Badge>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>Nov 20, 2025</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>5:30 PM - 6:30 PM</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    Massage
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Aromatherapy
                                  </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 flex-1"
                                  >
                                    <Star className="h-3 w-3 mr-1" />
                                    Review
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 flex-1"
                                  >
                                    Book Again
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Cancelled Appointments - Empty State */}
                      {appointmentFilter === "cancelled" && (
                        <Card className="lg:col-span-2">
                          <CardContent className="p-12">
                            <div className="text-center text-gray-500">
                              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-lg font-medium">
                                No cancelled appointments
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Empty State for No Appointments */}
                    {/* <Card>
                      <CardContent className="p-6">
                        <div className="text-center py-12 text-gray-500">
                          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-xl font-semibold mb-2">
                            No appointments yet
                          </h3>
                          <p className="mb-6">
                            Book your first appointment and experience premium beauty services
                          </p>
                          <Button
                            onClick={() => (window.location.href = "/#book")}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Browse Salons
                          </Button>
                        </div>
                      </CardContent>
                    </Card> */}
                  </div>
                )}

                {activeTab === "orders" && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-12 text-gray-500">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2">
                          No orders yet
                        </h3>
                        <p className="mb-6">
                          Start shopping to see your order history
                        </p>
                        <Button
                          onClick={() => (window.location.href = "/#shop")}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Browse Products
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "wishlist" && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-12 text-gray-500">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2">
                          Your wishlist is empty
                        </h3>
                        <p className="mb-6">Save items you love for later</p>
                        <Button
                          onClick={() => (window.location.href = "/#shop")}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Discover Products
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "settings" && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-6">
                        Account Settings
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            defaultValue={user.name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            defaultValue={user.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            defaultValue={user.phone}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div className="pt-4">
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <Footer />
          <Toaster />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
