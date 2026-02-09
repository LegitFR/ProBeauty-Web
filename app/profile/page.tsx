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
  Trash2,
  Plus,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
} from "@/lib/api/address";
import {
  getBookings,
  type Booking,
  type BookingStatus,
} from "@/lib/api/booking";
import {
  getOrders,
  cancelOrder,
  type Order,
  type OrderStatus,
} from "@/lib/api/order";
import { getMyReviews, deleteReview, updateReview } from "@/lib/api/review";
import type { Review } from "@/lib/types/review";
import { ReviewsList } from "@/components/ReviewsList";
import { ReviewForm } from "@/components/ReviewForm";
import {
  getMyStaffReviews,
  deleteStaffReview,
  updateStaffReview,
  type StaffReview,
} from "@/lib/api/staff";
import StaffReviewForm from "@/components/StaffReviewForm";
import StaffReviewsList from "@/components/StaffReviewsList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "appointments" | "orders" | "wishlist" | "reviews" | "settings"
  >("overview");
  const [appointmentFilter, setAppointmentFilter] = useState<
    "upcoming" | "past" | "cancelled"
  >("upcoming");
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Settings tab state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Bookings and Orders state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  // Staff Reviews state
  const [staffReviews, setStaffReviews] = useState<StaffReview[]>([]);
  const [loadingStaffReviews, setLoadingStaffReviews] = useState(false);
  const [showStaffReviewDialog, setShowStaffReviewDialog] = useState(false);
  const [staffReviewBooking, setStaffReviewBooking] = useState<Booking | null>(
    null,
  );
  const [editingStaffReview, setEditingStaffReview] =
    useState<StaffReview | null>(null);
  const [showEditStaffDialog, setShowEditStaffDialog] = useState(false);
  const [showDeleteStaffDialog, setShowDeleteStaffDialog] = useState(false);
  const [deletingStaffReview, setDeletingStaffReview] =
    useState<StaffReview | null>(null);

  // Order detail modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetailDialog, setShowOrderDetailDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [addressFormData, setAddressFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United Kingdom",
    isDefault: false,
  });

  useEffect(() => {
    setMounted(true);

    // Small delay to ensure localStorage is ready and DOM is hydrated
    const checkAuth = () => {
      try {
        const accessToken =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;
        const userStr =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;

        console.log("[Profile] Authentication check:");
        console.log("- Access Token:", accessToken ? "Present" : "Missing");
        console.log("- Refresh Token:", refreshToken ? "Present" : "Missing");
        console.log("- User Data:", userStr ? "Present" : "Missing");

        if (!isAuthenticated()) {
          console.log("[Profile] Not authenticated, redirecting to home");
          setAuthChecked(true);
          router.replace("/");
          return;
        }

        const userData = getUser();
        console.log("[Profile] User data retrieved:", userData);

        if (!userData) {
          console.log("[Profile] No user data found, redirecting to home");
          setAuthChecked(true);
          router.replace("/");
          return;
        }

        console.log("[Profile] Authentication successful, loading profile");
        setAuthChecked(true);
        setUser(userData);
        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
        });

        // Load initial data
        loadBookings();
        loadOrders();
      } catch (error) {
        console.error("[Profile] Error loading user:", error);
        setAuthChecked(true);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure localStorage is accessible
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Load addresses when settings tab is active
  useEffect(() => {
    if (activeTab === "settings" && user) {
      loadAddresses();
    }
  }, [activeTab, user]);

  // Load bookings when appointments tab is active
  useEffect(() => {
    if (activeTab === "appointments" && user) {
      loadBookings();
    }
  }, [activeTab, user]);

  // Load orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  // Load reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === "reviews" && user) {
      loadReviews();
      loadStaffReviews();
      loadBookings(); // Also load bookings for "Rate Your Recent Visits" section
    }
  }, [activeTab, user]);

  const loadAddresses = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoadingAddresses(true);
    try {
      const data = await getAddresses(token);
      setAddresses(data);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadBookings = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoadingBookings(true);
    try {
      const response = await getBookings(token);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadOrders = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoadingOrders(true);
    try {
      const response = await getOrders(token);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadReviews = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoadingReviews(true);
    try {
      const response = await getMyReviews(token, 1, 10);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadStaffReviews = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoadingStaffReviews(true);
    try {
      const response = await getMyStaffReviews(token, 1, 10);
      setStaffReviews(response.data || []);
    } catch (error) {
      console.error("Failed to load staff reviews:", error);
    } finally {
      setLoadingStaffReviews(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReview) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to delete review");
      return;
    }

    try {
      await deleteReview(token, deletingReview.id);
      toast.success("Review deleted successfully");
      setShowDeleteDialog(false);
      setDeletingReview(null);
      loadReviews(); // Reload reviews
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete review",
      );
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingReview(null);
    loadReviews(); // Reload reviews
    toast.success("Review updated successfully");
  };

  const handleDeleteStaffReview = async () => {
    if (!deletingStaffReview) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to delete review");
      return;
    }

    try {
      await deleteStaffReview(token, deletingStaffReview.id);
      toast.success("Staff review deleted successfully");
      setShowDeleteStaffDialog(false);
      setDeletingStaffReview(null);
      loadStaffReviews(); // Reload staff reviews
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete staff review",
      );
    }
  };

  const handleEditStaffSuccess = () => {
    setShowEditStaffDialog(false);
    setEditingStaffReview(null);
    loadStaffReviews(); // Reload staff reviews
    toast.success("Staff review updated successfully");
  };

  const handleStaffReviewSuccess = () => {
    setShowStaffReviewDialog(false);
    setStaffReviewBooking(null);
    loadStaffReviews();
    toast.success("Staff review submitted successfully!");
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      await cancelOrder(token, orderId);
      alert("Order cancelled successfully");
      await loadOrders(); // Reload orders
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      alert(error?.message || "Failed to cancel order");
    }
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update API
    console.log("Saving profile:", formData);
  };

  const handleCreateAddress = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setSavingAddress(true);
    try {
      await createAddress(token, addressFormData);
      await loadAddresses();
      setShowNewAddressForm(false);
      resetAddressForm();
      alert("Address added successfully");
    } catch (error: any) {
      console.error("Failed to create address:", error);
      alert(error?.message || "Failed to add address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleUpdateAddress = async (addressId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setSavingAddress(true);
    try {
      await updateAddress(token, addressId, addressFormData);
      await loadAddresses();
      setEditingAddress(null);
      resetAddressForm();
      alert("Address updated successfully");
    } catch (error: any) {
      console.error("Failed to update address:", error);
      alert(error?.message || "Failed to update address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      await deleteAddress(token, addressId);
      await loadAddresses();
      alert("Address deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete address:", error);
      alert(error?.message || "Failed to delete address. Please try again.");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      await setDefaultAddress(token, addressId);
      await loadAddresses();
      alert("Default address updated");
    } catch (error: any) {
      console.error("Failed to set default address:", error);
      alert(
        error?.message || "Failed to set default address. Please try again.",
      );
    }
  };

  const startEditAddress = (address: Address) => {
    setEditingAddress(address.id);
    setAddressFormData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
  };

  const resetAddressForm = () => {
    setAddressFormData({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United Kingdom",
      isDefault: false,
    });
  };

  // Prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
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
        <div className="min-h-screen bg-[#ECE3DC]">
          <Header />

          {/* Hero Section with Cover */}
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 sm:h-64 bg-linear-to-r from-[#4D1C00] via-[#792800] to-[#F44A01] relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
            </div>

            {/* Profile Card - Overlapping */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
              <Card className="bg-[#ECE3DC] shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-linear-to-br from-orange-400 via-pink-500 to-purple-500 p-1">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <span className="text-5xl font-bold bg-linear-to-br from-orange-500 to-pink-500 bg-clip-text text-transparent">
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
                        <div
                          className="text-center cursor-pointer"
                          onClick={() => setActiveTab("appointments")}
                        >
                          <div className="text-2xl font-bold text-gray-900">
                            {bookings.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Appointments
                          </div>
                        </div>
                        <div
                          className="text-center cursor-pointer"
                          onClick={() => setActiveTab("orders")}
                        >
                          <div className="text-2xl font-bold text-gray-900">
                            {orders.length}
                          </div>
                          <div className="text-sm text-gray-600">Orders</div>
                        </div>
                        <div
                          className="text-center cursor-pointer"
                          onClick={() => setActiveTab("wishlist")}
                        >
                          <div className="text-2xl font-bold text-gray-900">
                            0
                          </div>
                          <div className="text-sm text-gray-600">Wishlist</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="mt-8 flex gap-2 border-b border-gray-200 scrollbar overflow-x-scroll md:overflow-hidden">
                {[
                  { key: "overview", label: "Overview", icon: User },
                  {
                    key: "appointments",
                    label: "Appointments",
                    icon: Calendar,
                  },
                  { key: "orders", label: "My Orders", icon: ShoppingBag },
                  { key: "wishlist", label: "Wishlist", icon: Heart },
                  { key: "reviews", label: "My Reviews", icon: Star },
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
                    <Card className="hover:shadow-lg transition-shadow md:col-span-2 bg-[#ECE3DC]">
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
                          {(() => {
                            const now = new Date();
                            const upcomingBookings = bookings
                              .filter((booking) => {
                                const startTime = new Date(booking.startTime);
                                return (
                                  startTime >= now &&
                                  (booking.status === "CONFIRMED" ||
                                    booking.status === "PENDING")
                                );
                              })
                              .slice(0, 3); // Show only first 3 upcoming appointments

                            if (upcomingBookings.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <Calendar className="h-12 w-12 mx-auto mb-2 text-orange-500" />
                                  <p>No upcoming appointments</p>
                                  <Button
                                    onClick={() =>
                                      (window.location.href = "/#book")
                                    }
                                    className="mt-4 bg-orange-500 hover:bg-orange-600"
                                  >
                                    Book Appointment
                                  </Button>
                                </div>
                              );
                            }

                            return upcomingBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="group flex gap-3 p-4 bg-gradient-to-br from-white to-orange-50/30 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-orange-100/50"
                                onClick={() => setActiveTab("appointments")}
                              >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#F44A01] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                                  <span className="text-xl font-bold text-white">
                                    {booking.salon?.name
                                      ?.charAt(0)
                                      .toUpperCase() || "S"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate mb-0.5">
                                    {booking.salon?.name || "Salon"}
                                  </h4>
                                  <p className="text-xs text-[#FF6A00] font-medium truncate mb-2">
                                    {booking.service?.title || "Service"}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Clock className="h-3.5 w-3.5 text-[#FF6A00]" />
                                    <span className="font-medium">
                                      {new Date(
                                        booking.startTime,
                                      ).toLocaleDateString("en", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                      {" at "}
                                      {new Date(
                                        booking.startTime,
                                      ).toLocaleTimeString("en", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  className={`text-xs h-fit px-3 py-1 font-medium ${
                                    booking.status === "CONFIRMED"
                                      ? "bg-gradient-to-r from-orange-100 to-orange-200 text-[#FF6A00] border-orange-300"
                                      : "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-300"
                                  }`}
                                >
                                  {booking.status.charAt(0) +
                                    booking.status.slice(1).toLowerCase()}
                                </Badge>
                              </div>
                            ));
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="hover:shadow-lg transition-shadow md:col-span-2 bg-[#ECE3DC]">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          Recent Activity
                        </h3>
                        <div className="space-y-4">
                          <div className="text-center py-8 text-gray-500">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-2 text-orange-500" />
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
                    <Card className="hover:shadow-lg transition-shadow md:col-span-2 bg-[#ECE3DC]">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Star className="h-5 w-5 text-orange-500" />
                          Favorite Salons
                        </h3>
                        <div className="text-center py-8 text-gray-500">
                          <Heart className="h-12 w-12 mx-auto mb-2 text-orange-500" />
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
                        onClick={() => (window.location.href = "/salons")}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book New
                      </Button>
                    </div>

                    {loadingBookings ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                          {[
                            {
                              key: "upcoming" as const,
                              label: "Upcoming",
                              count: bookings.filter((b) => {
                                const now = new Date();
                                const startTime = new Date(b.startTime);
                                return (
                                  startTime >= now &&
                                  (b.status === "CONFIRMED" ||
                                    b.status === "PENDING")
                                );
                              }).length,
                            },
                            {
                              key: "past" as const,
                              label: "Past",
                              count: bookings.filter((b) => {
                                const now = new Date();
                                const startTime = new Date(b.startTime);
                                return (
                                  (startTime < now ||
                                    b.status === "COMPLETED") &&
                                  b.status !== "CANCELLED" &&
                                  b.status !== "NO_SHOW"
                                );
                              }).length,
                            },
                            {
                              key: "cancelled" as const,
                              label: "Cancelled",
                              count: bookings.filter(
                                (b) =>
                                  b.status === "CANCELLED" ||
                                  b.status === "NO_SHOW",
                              ).length,
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
                          {(() => {
                            const now = new Date();
                            const filtered = bookings.filter((booking) => {
                              const startTime = new Date(booking.startTime);
                              if (appointmentFilter === "upcoming") {
                                return (
                                  startTime >= now &&
                                  (booking.status === "CONFIRMED" ||
                                    booking.status === "PENDING")
                                );
                              } else if (appointmentFilter === "past") {
                                return (
                                  (startTime < now ||
                                    booking.status === "COMPLETED") &&
                                  booking.status !== "CANCELLED" &&
                                  booking.status !== "NO_SHOW"
                                );
                              } else if (appointmentFilter === "cancelled") {
                                return (
                                  booking.status === "CANCELLED" ||
                                  booking.status === "NO_SHOW"
                                );
                              }
                              return false;
                            });

                            if (filtered.length === 0) {
                              return (
                                <Card className="lg:col-span-2 bg-[#ECE3DC]">
                                  <CardContent className="p-12">
                                    <div className="text-center text-gray-500">
                                      <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                      <p className="text-lg font-medium">
                                        No {appointmentFilter} appointments
                                      </p>
                                      <Button
                                        onClick={() =>
                                          (window.location.href = "/salons")
                                        }
                                        className="mt-4 bg-orange-500 hover:bg-orange-600"
                                      >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Browse Salons
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }

                            return filtered.map((booking) => (
                              <Card
                                key={booking.id}
                                className={`hover:shadow-lg transition-shadow bg-[#ECE3DC] ${
                                  appointmentFilter === "past"
                                    ? "opacity-60 hover:opacity-100"
                                    : ""
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    {/* Salon Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-pink-100">
                                        <span className="text-2xl font-bold text-orange-500">
                                          {booking.salon?.name
                                            ?.charAt(0)
                                            .toUpperCase() || "S"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Appointment Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-semibold text-gray-900 truncate">
                                            {booking.salon?.name || "Salon"}
                                          </h4>
                                          <p className="text-xs text-gray-600 flex items-center gap-1">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                              {booking.salon?.address ||
                                                "Address"}
                                            </span>
                                          </p>
                                        </div>
                                        <Badge
                                          className={`text-xs shrink-0 ${
                                            booking.status === "CONFIRMED"
                                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                                              : booking.status === "PENDING"
                                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                : booking.status === "COMPLETED"
                                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                                  : "bg-red-100 text-red-700 hover:bg-red-100"
                                          }`}
                                        >
                                          {booking.status.charAt(0) +
                                            booking.status
                                              .slice(1)
                                              .toLowerCase()}
                                        </Badge>
                                      </div>

                                      <div className="space-y-1 text-sm mb-3">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                          <span className="font-medium">
                                            {new Date(
                                              booking.startTime,
                                            ).toLocaleDateString("en", {
                                              weekday: "short",
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Clock className="h-3.5 w-3.5 shrink-0" />
                                          <span>
                                            {new Date(
                                              booking.startTime,
                                            ).toLocaleTimeString("en", {
                                              hour: "numeric",
                                              minute: "2-digit",
                                            })}{" "}
                                            -{" "}
                                            {new Date(
                                              booking.endTime,
                                            ).toLocaleTimeString("en", {
                                              hour: "numeric",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {booking.service && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {booking.service.title}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            ${booking.service.price}
                                          </Badge>
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      {appointmentFilter === "past" && (
                                        <div className="flex gap-2">
                                          {booking.status === "COMPLETED" &&
                                            !reviews.some(
                                              (review) =>
                                                review.salonId ===
                                                  booking.salonId &&
                                                review.serviceId ===
                                                  booking.serviceId,
                                            ) && (
                                              <Button
                                                size="sm"
                                                onClick={() => {
                                                  setReviewBooking(booking);
                                                  setShowReviewDialog(true);
                                                }}
                                                className="bg-orange-500 hover:bg-orange-600 flex-1"
                                              >
                                                <Star className="h-3 w-3 mr-1" />
                                                Write Review
                                              </Button>
                                            )}
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              router.push(
                                                `/salons/${booking.salonId}/book`,
                                              )
                                            }
                                            className="border-gray-300 flex-1"
                                          >
                                            Book Again
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ));
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Your Orders
                      </h2>
                    </div>

                    {loadingOrders ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                      </div>
                    ) : orders.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 bg-[#ECE3DC]">
                          <div className="text-center py-12 text-gray-500">
                            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                            <h3 className="text-xl font-semibold mb-2">
                              No orders yet
                            </h3>
                            <p className="mb-6">
                              Start shopping to see your order history
                            </p>
                            <Button
                              onClick={() => router.push("/")}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              Browse Products
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {orders.map((order) => (
                          <Card
                            key={order.id}
                            className="hover:shadow-lg transition-shadow bg-[#ECE3DC]"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Order Header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Order #{order.id.slice(-8)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(
                                        order.createdAt,
                                      ).toLocaleDateString("en", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`text-xs ${
                                      order.status === "DELIVERED"
                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                        : order.status === "SHIPPED"
                                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                          : order.status === "CONFIRMED"
                                            ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                                            : order.status === "PAYMENT_PENDING"
                                              ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                              : order.status ===
                                                  "PAYMENT_FAILED"
                                                ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                                : order.status === "CANCELLED"
                                                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                    }`}
                                  >
                                    {order.status.replace(/_/g, " ")}
                                  </Badge>
                                </div>

                                {/* Salon Info */}
                                {order.salon && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium">
                                      {order.salon.name}
                                    </span>
                                  </div>
                                )}

                                {/* Order Items */}
                                {order.orderItems &&
                                  order.orderItems.length > 0 && (
                                    <div className="space-y-2">
                                      {order.orderItems
                                        .slice(0, 2)
                                        .map((item) => (
                                          <div
                                            key={item.id}
                                            className="flex items-center gap-3 text-sm"
                                          >
                                            {item.product?.images?.[0] ? (
                                              <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                                                <img
                                                  src={item.product.images[0]}
                                                  alt={item.product.title}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            ) : (
                                              <div className="w-12 h-12 rounded bg-gray-100 shrink-0 flex items-center justify-center">
                                                <ShoppingBag className="h-5 w-5 text-gray-400" />
                                              </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium truncate">
                                                {item.product?.title ||
                                                  "Product"}
                                              </p>
                                              <p className="text-xs text-gray-600">
                                                Qty: {item.quantity}
                                              </p>
                                            </div>
                                            <p className="font-semibold text-orange-600">
                                              ${item.unitPrice}
                                            </p>
                                          </div>
                                        ))}
                                      {order.orderItems.length > 2 && (
                                        <p className="text-xs text-gray-500">
                                          + {order.orderItems.length - 2} more
                                          items
                                        </p>
                                      )}
                                    </div>
                                  )}

                                {/* Total */}
                                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                                  <span className="font-semibold">Total</span>
                                  <span className="font-bold text-lg text-orange-600">
                                    ${order.total}
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setShowOrderDetailDialog(true);
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600 flex-1"
                                  >
                                    View Details
                                  </Button>
                                  {(order.status === "PENDING" ||
                                    order.status === "PAYMENT_PENDING" ||
                                    order.status === "PAYMENT_FAILED" ||
                                    order.status === "CONFIRMED") && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleCancelOrder(order.id)
                                      }
                                      className="border-red-500 text-red-600 hover:bg-red-50 hover:text-[#1e1e1e] flex-1"
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "wishlist" && (
                  <Card>
                    <CardContent className="p-6 bg-[#ECE3DC]">
                      <div className="text-center py-12 text-gray-500">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-orange-500" />
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

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6 bg-[#ECE3DC]">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold">
                              My Reviews
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Your reviews help others make better decisions
                            </p>
                          </div>
                        </div>

                        {loadingReviews ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No reviews yet</p>
                            <p className="text-sm mt-1">
                              After completing a booking, you can leave a review
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <Card
                                key={review.id}
                                className="hover:shadow-lg transition-shadow bg-[#ECE3DC]"
                              >
                                <CardContent className="p-5">
                                  <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <h4 className="font-semibold text-gray-900">
                                          {review.salon?.name}
                                        </h4>
                                        {review.service && (
                                          <p className="text-sm text-gray-600">
                                            {review.service.title}
                                          </p>
                                        )}
                                        <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`w-4 h-4 ${
                                                star <= review.rating
                                                  ? "fill-yellow-400 text-yellow-400"
                                                  : "text-gray-300"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-500">
                                          {new Date(
                                            review.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setEditingReview(review);
                                            setShowEditDialog(true);
                                          }}
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setDeletingReview(review);
                                            setShowDeleteDialog(true);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                      <p className="text-sm leading-relaxed text-gray-700">
                                        {review.comment}
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Completed bookings that can be reviewed */}
                    <Card className="bg-[#ECE3DC]">
                      <CardContent className="p-6 bg-[#ECE3DC]">
                        <h3 className="text-lg font-semibold mb-6">
                          Rate Your Recent Visits
                        </h3>
                        {(() => {
                          const completedBookings = bookings.filter(
                            (booking) =>
                              booking.status === "COMPLETED" &&
                              !reviews.some(
                                (review) =>
                                  review.salonId === booking.salonId &&
                                  review.serviceId === booking.serviceId,
                              ),
                          );

                          if (completedBookings.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <p>No bookings to review at the moment</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              {completedBookings.slice(0, 5).map((booking) => (
                                <Card
                                  key={booking.id}
                                  className="hover:shadow-lg transition-shadow bg-[#ECE3DC]"
                                >
                                  <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">
                                          {booking.salon?.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {booking.service?.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(
                                            booking.startTime,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Button
                                        onClick={() => {
                                          setReviewBooking(booking);
                                          setShowReviewDialog(true);
                                        }}
                                        className="bg-orange-500 hover:bg-orange-600"
                                      >
                                        Write Review
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Edit Review Dialog */}
                    <Dialog
                      open={showEditDialog}
                      onOpenChange={setShowEditDialog}
                    >
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Your Review</DialogTitle>
                        </DialogHeader>
                        {editingReview && (
                          <ReviewForm
                            salonId={editingReview.salonId}
                            serviceId={editingReview.serviceId || undefined}
                            existingReview={editingReview}
                            onSuccess={handleEditSuccess}
                            onCancel={() => {
                              setShowEditDialog(false);
                              setEditingReview(null);
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog
                      open={showDeleteDialog}
                      onOpenChange={setShowDeleteDialog}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this review? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setDeletingReview(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteReview}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* STAFF REVIEWS SECTION */}
                    <Card>
                      <CardContent className="p-6 bg-[#ECE3DC]">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Award className="h-5 w-5 text-orange-500" />
                              My Staff Reviews
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Your reviews help staff members improve their
                              service
                            </p>
                          </div>
                        </div>

                        {loadingStaffReviews ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                          </div>
                        ) : staffReviews.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No staff reviews yet</p>
                            <p className="text-sm mt-1">
                              After completing a booking, you can review the
                              staff member
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {staffReviews.map((review) => (
                              <Card
                                key={review.id}
                                className="hover:shadow-lg transition-shadow bg-[#ECE3DC]"
                              >
                                <CardContent className="p-5">
                                  <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <h4 className="font-semibold text-gray-900">
                                          {review.staff?.name ||
                                            review.staff?.user?.name}
                                        </h4>
                                        {review.staff?.salon && (
                                          <p className="text-sm text-gray-600">
                                            {review.staff.salon.name}
                                          </p>
                                        )}
                                        {review.booking?.service && (
                                          <p className="text-xs text-gray-500">
                                            {review.booking.service.title}
                                          </p>
                                        )}
                                        <div className="flex gap-0.5 mt-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`w-4 h-4 ${
                                                star <= review.rating
                                                  ? "fill-yellow-400 text-yellow-400"
                                                  : "text-gray-300"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-500">
                                          {new Date(
                                            review.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setEditingStaffReview(review);
                                            setShowEditStaffDialog(true);
                                          }}
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setDeletingStaffReview(review);
                                            setShowDeleteStaffDialog(true);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                      <p className="text-sm leading-relaxed text-gray-700">
                                        {review.comment}
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Completed bookings where staff can be reviewed */}
                    <Card className="bg-[#ECE3DC]">
                      <CardContent className="p-6 bg-[#ECE3DC]">
                        <h3 className="text-lg font-semibold mb-6">
                          Rate Your Service Providers
                        </h3>
                        {(() => {
                          const completedBookings = bookings.filter(
                            (booking) =>
                              booking.status === "COMPLETED" &&
                              booking.staffId &&
                              !staffReviews.some(
                                (review) =>
                                  review.staffId === booking.staffId &&
                                  review.bookingId === booking.id,
                              ),
                          );

                          if (completedBookings.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <p>No staff members to review at the moment</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              {completedBookings.slice(0, 5).map((booking) => (
                                <Card
                                  key={booking.id}
                                  className="hover:shadow-lg transition-shadow bg-[#ECE3DC]"
                                >
                                  <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">
                                          {booking.staff?.user?.name ||
                                            "Staff Member"}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {booking.service?.title} at{" "}
                                          {booking.salon?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(
                                            booking.startTime,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Button
                                        onClick={() => {
                                          setStaffReviewBooking(booking);
                                          setShowStaffReviewDialog(true);
                                        }}
                                        className="bg-orange-500 hover:bg-orange-600"
                                      >
                                        Write Review
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Staff Review Dialog */}
                    <Dialog
                      open={showStaffReviewDialog}
                      onOpenChange={setShowStaffReviewDialog}
                    >
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Rate Your Service Provider</DialogTitle>
                        </DialogHeader>
                        {staffReviewBooking && (
                          <StaffReviewForm
                            staffId={staffReviewBooking.staffId}
                            bookingId={staffReviewBooking.id}
                            staffName={
                              staffReviewBooking.staff?.user?.name ||
                              "Staff Member"
                            }
                            onSuccess={handleStaffReviewSuccess}
                            onCancel={() => {
                              setShowStaffReviewDialog(false);
                              setStaffReviewBooking(null);
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Edit Staff Review Dialog */}
                    <Dialog
                      open={showEditStaffDialog}
                      onOpenChange={setShowEditStaffDialog}
                    >
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Staff Review</DialogTitle>
                        </DialogHeader>
                        {editingStaffReview && (
                          <Card className="border-[#D4C5B9] bg-[#ECE3DC]">
                            <CardContent className="pt-6">
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const token =
                                    localStorage.getItem("accessToken");
                                  if (!token || !editingStaffReview) return;

                                  try {
                                    const formData = new FormData(
                                      e.currentTarget,
                                    );
                                    await updateStaffReview(
                                      token,
                                      editingStaffReview.id,
                                      {
                                        rating: parseInt(
                                          formData.get("rating") as string,
                                        ),
                                        comment:
                                          (formData.get("comment") as string) ||
                                          undefined,
                                      },
                                    );
                                    handleEditStaffSuccess();
                                  } catch (error) {
                                    toast.error("Failed to update review");
                                  }
                                }}
                                className="space-y-4"
                              >
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Rating
                                  </label>
                                  <select
                                    name="rating"
                                    defaultValue={editingStaffReview.rating}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                  >
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Comment
                                  </label>
                                  <textarea
                                    name="comment"
                                    defaultValue={
                                      editingStaffReview.comment || ""
                                    }
                                    className="w-full px-4 py-2 border rounded-lg"
                                    rows={4}
                                    maxLength={1000}
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowEditStaffDialog(false);
                                      setEditingStaffReview(null);
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                                  >
                                    Update Review
                                  </Button>
                                </div>
                              </form>
                            </CardContent>
                          </Card>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Delete Staff Review Confirmation Dialog */}
                    <AlertDialog
                      open={showDeleteStaffDialog}
                      onOpenChange={setShowDeleteStaffDialog}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Staff Review
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this staff review?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setDeletingStaffReview(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteStaffReview}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                      <CardContent className="p-6 bg-[#ECE3DC]">
                        <h3 className="text-lg font-semibold mb-6">
                          Personal Information
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={user.email}
                              disabled
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-[#ECE3DC] cursor-not-allowed text-gray-600"
                            />
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                              Email cannot be changed
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                            />
                          </div>
                          <div className="pt-4">
                            <Button
                              onClick={handleSaveProfile}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Saved Addresses */}
                    <Card>
                      <CardContent className="p-6 bg-[#ECE3DC]">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold">
                            Saved Addresses
                          </h3>
                          <Button
                            onClick={() => {
                              setShowNewAddressForm(true);
                              resetAddressForm();
                            }}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Address
                          </Button>
                        </div>

                        {loadingAddresses ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* New Address Form */}
                            {showNewAddressForm && (
                              <Card className="border-2 border-[#FF6A00] shadow-lg">
                                <CardContent className="p-6 bg-[#ECE3DC]">
                                  <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-semibold text-lg text-gray-900">
                                      New Address
                                    </h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setShowNewAddressForm(false);
                                        resetAddressForm();
                                      }}
                                      className="hover:bg-orange-100 text-gray-600 hover:text-gray-900"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Full Name *
                                      </label>
                                      <input
                                        type="text"
                                        value={addressFormData.fullName}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            fullName: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Phone *
                                      </label>
                                      <input
                                        type="tel"
                                        value={addressFormData.phone}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            phone: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Address Line 1 *
                                      </label>
                                      <input
                                        type="text"
                                        value={addressFormData.addressLine1}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            addressLine1: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Address Line 2
                                      </label>
                                      <input
                                        type="text"
                                        value={addressFormData.addressLine2}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            addressLine2: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        City *
                                      </label>
                                      <input
                                        type="text"
                                        value={addressFormData.city}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            city: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        State/County *
                                      </label>
                                      <input
                                        type="text"
                                        value={addressFormData.state}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            state: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Postal Code *
                                      </label>
                                      <input
                                        type="text"
                                        value={addressFormData.postalCode}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            postalCode: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Country *
                                      </label>
                                      <input
                                        type="text"
                                        value={addressFormData.country}
                                        onChange={(e) =>
                                          setAddressFormData({
                                            ...addressFormData,
                                            country: e.target.value,
                                          })
                                        }
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] bg-[#ECE3DC] transition-all outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 mt-6 p-3 bg-orange-50 rounded-lg">
                                    <input
                                      type="checkbox"
                                      id="new-default"
                                      checked={addressFormData.isDefault}
                                      onChange={(e) =>
                                        setAddressFormData({
                                          ...addressFormData,
                                          isDefault: e.target.checked,
                                        })
                                      }
                                      className="rounded border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00] w-4 h-4"
                                    />
                                    <label
                                      htmlFor="new-default"
                                      className="text-sm text-gray-800 font-medium cursor-pointer"
                                    >
                                      Set as default address
                                    </label>
                                  </div>
                                  <div className="flex gap-3 mt-6">
                                    <Button
                                      onClick={handleCreateAddress}
                                      disabled={savingAddress}
                                      className="bg-[#FF6A00] hover:bg-[#FF7A00] text-white px-6 py-2.5 rounded-xl font-medium transition-all"
                                    >
                                      {savingAddress
                                        ? "Saving..."
                                        : "Save Address"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowNewAddressForm(false);
                                        resetAddressForm();
                                      }}
                                      className="border-2 border-gray-300 hover:bg-gray-100 px-6 py-2.5 rounded-xl font-medium"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Existing Addresses */}
                            {addresses.length === 0 && !showNewAddressForm ? (
                              <div className="text-center py-12 text-gray-500">
                                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No saved addresses</p>
                                <p className="text-sm mt-1">
                                  Add your first address to get started
                                </p>
                              </div>
                            ) : (
                              addresses.map((address) => (
                                <Card
                                  key={address.id}
                                  className={`transition-all hover:shadow-lg ${
                                    address.isDefault
                                      ? "border-2 border-[#FF6A00] shadow-md"
                                      : "border border-gray-200"
                                  }`}
                                >
                                  <CardContent
                                    className={`p-5 ${
                                      address.isDefault
                                        ? "bg-gradient-to-br from-orange-50/50 to-white"
                                        : "bg-[#ECE3DC]"
                                    }`}
                                  >
                                    {editingAddress === address.id ? (
                                      <>
                                        <div className="flex items-center justify-between mb-4">
                                          <h4 className="font-semibold">
                                            Edit Address
                                          </h4>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setEditingAddress(null);
                                              resetAddressForm();
                                            }}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Full Name *
                                            </label>
                                            <input
                                              type="text"
                                              value={addressFormData.fullName}
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  fullName: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Phone *
                                            </label>
                                            <input
                                              type="tel"
                                              value={addressFormData.phone}
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  phone: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                          <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Address Line 1 *
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                addressFormData.addressLine1
                                              }
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  addressLine1: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                          <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Address Line 2
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                addressFormData.addressLine2
                                              }
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  addressLine2: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              City *
                                            </label>
                                            <input
                                              type="text"
                                              value={addressFormData.city}
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  city: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              State/County *
                                            </label>
                                            <input
                                              type="text"
                                              value={addressFormData.state}
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  state: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Postal Code *
                                            </label>
                                            <input
                                              type="text"
                                              value={addressFormData.postalCode}
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  postalCode: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Country *
                                            </label>
                                            <input
                                              type="text"
                                              value={addressFormData.country}
                                              onChange={(e) =>
                                                setAddressFormData({
                                                  ...addressFormData,
                                                  country: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4">
                                          <input
                                            type="checkbox"
                                            id={`edit-default-${address.id}`}
                                            checked={addressFormData.isDefault}
                                            onChange={(e) =>
                                              setAddressFormData({
                                                ...addressFormData,
                                                isDefault: e.target.checked,
                                              })
                                            }
                                            className="rounded border-gray-300"
                                          />
                                          <label
                                            htmlFor={`edit-default-${address.id}`}
                                            className="text-sm text-gray-700"
                                          >
                                            Set as default address
                                          </label>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                          <Button
                                            onClick={() =>
                                              handleUpdateAddress(address.id)
                                            }
                                            disabled={savingAddress}
                                            className="bg-orange-500 hover:bg-orange-600"
                                          >
                                            {savingAddress
                                              ? "Saving..."
                                              : "Save Changes"}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setEditingAddress(null);
                                              resetAddressForm();
                                            }}
                                            className="border-gray-300"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <h4 className="font-semibold">
                                                {address.fullName}
                                              </h4>
                                              {address.isDefault && (
                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                                  Default
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                              <p className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5" />
                                                {address.phone}
                                              </p>
                                              <p className="flex items-start gap-2">
                                                <MapPin className="h-3.5 w-3.5 mt-0.5" />
                                                <span>
                                                  {address.addressLine1}
                                                  {address.addressLine2 &&
                                                    `, ${address.addressLine2}`}
                                                  <br />
                                                  {address.city},{" "}
                                                  {address.state}{" "}
                                                  {address.postalCode}
                                                  <br />
                                                  {address.country}
                                                </span>
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                startEditAddress(address)
                                              }
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                console.log(
                                                  "Deleting address with ID:",
                                                  address.id,
                                                );
                                                console.log(
                                                  "Full address object:",
                                                  address,
                                                );
                                                handleDeleteAddress(address.id);
                                              }}
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        {!address.isDefault && (
                                          <div className="mt-3 pt-3 border-t">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleSetDefaultAddress(
                                                  address.id,
                                                )
                                              }
                                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                            >
                                              <Check className="h-3.5 w-3.5 mr-1" />
                                              Set as Default
                                            </Button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Footer />
          <Toaster />

          {/* Review Dialog */}
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              {reviewBooking && (
                <ReviewForm
                  salonId={reviewBooking.salonId}
                  serviceId={reviewBooking.serviceId}
                  salonName={reviewBooking.salon?.name}
                  serviceName={reviewBooking.service?.title}
                  onSuccess={() => {
                    setShowReviewDialog(false);
                    setReviewBooking(null);
                    loadReviews();
                  }}
                  onCancel={() => {
                    setShowReviewDialog(false);
                    setReviewBooking(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Order Detail Dialog */}
          <Dialog
            open={showOrderDetailDialog}
            onOpenChange={setShowOrderDetailDialog}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">
                        #{selectedOrder.id.slice(0, 8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge
                        className={
                          selectedOrder.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : selectedOrder.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : selectedOrder.status === "CONFIRMED"
                                ? "bg-purple-100 text-purple-800"
                                : selectedOrder.status === "PAYMENT_PENDING"
                                  ? "bg-orange-100 text-orange-800"
                                  : selectedOrder.status === "PAYMENT_FAILED"
                                    ? "bg-rose-100 text-rose-800"
                                    : selectedOrder.status === "CANCELLED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {selectedOrder.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-orange-600">
                        ${selectedOrder.total}
                      </p>
                    </div>
                  </div>

                  {/* Salon Info */}
                  {selectedOrder.salon && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Salon Information</h3>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">
                          {selectedOrder.salon.name}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedOrder.salon.address}
                        </p>
                        {selectedOrder.salon.verified && (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="border rounded-lg">
                    <h3 className="font-semibold p-4 border-b flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Order Items
                    </h3>
                    <div className="divide-y">
                      {selectedOrder.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 flex items-center gap-4"
                        >
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title || "Product"}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.product?.title || "Product"}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.unitPrice} × {item.quantity}
                            </p>
                            {item.product?.sku && (
                              <p className="text-xs text-gray-500">
                                SKU: {item.product.sku}
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-orange-600">
                            $
                            {(
                              parseFloat(item.unitPrice) * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="p-4 border-t bg-gray-50">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-orange-600">
                          ${selectedOrder.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    {(selectedOrder.status === "PENDING" ||
                      selectedOrder.status === "PAYMENT_PENDING" ||
                      selectedOrder.status === "PAYMENT_FAILED" ||
                      selectedOrder.status === "CONFIRMED") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleCancelOrder(selectedOrder.id);
                          setShowOrderDetailDialog(false);
                        }}
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setShowOrderDetailDialog(false)}
                      className="ml-auto"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
