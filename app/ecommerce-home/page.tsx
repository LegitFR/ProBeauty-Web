"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Star,
  X,
  Filter,
  Mic,
  Tag,
  Heart,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import {
  DisplayProduct,
  fetchProductsClient,
  transformProducts,
} from "@/lib/api/products";
import { useOffers } from "@/lib/hooks/useOffers";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { CartDrawer } from "@/components/CartDrawer";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "all", name: "All", icon: "🎯" },
  { id: "skincare", name: "Skincare", icon: "✨" },
  { id: "haircare", name: "Haircare", icon: "💇" },
  { id: "makeup", name: "Makeup", icon: "💄" },
  { id: "fragrance", name: "Fragrance", icon: "🌸" },
  { id: "tools", name: "Tools", icon: "🛠️" },
  { id: "trending", name: "Trending", icon: "🔥" },
];

export default function EcommerceHomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Fetch offers - for carousel show both product and salon offers
  const { offers: allOffers } = useOffers();
  const carouselOffers = allOffers.filter(
    (offer) => offer.offerType === "product" || offer.offerType === "salon",
  );

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      setIsAuthenticated(!!(token && user));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Category change (no debounce needed)
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  // Auto-rotate carousel
  useEffect(() => {
    if (carouselOffers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % carouselOffers.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [carouselOffers.length]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProductsClient({
        limit: 50,
        inStock: true,
        q: searchQuery || undefined,
      });
      let transformedProducts = transformProducts(response);

      // Client-side category filtering
      if (selectedCategory !== "all") {
        transformedProducts = transformedProducts.filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(selectedCategory.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(selectedCategory.toLowerCase()) ||
            product.category.toLowerCase() === selectedCategory.toLowerCase(),
        );
      }

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    // Navigate to product details or add to cart
    console.log("Product clicked:", productId);
  };

  const handleAddToCart = (product: DisplayProduct) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.finalPrice,
      image: product.image,
    });

    setAddedItems((prev) => new Set(prev).add(product.id));
    toast.success(`${product.name} added to cart!`);

    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const handleToggleWishlist = (product: DisplayProduct) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.finalPrice,
        image: product.image,
        brand: product.brand,
      });
      toast.success("Added to wishlist");
    }
  };

  const getProductOffers = (productId: string, salonId?: string) => {
    return allOffers.filter(
      (offer) =>
        (offer.offerType === "salon" && offer.salonId === salonId) ||
        (offer.offerType === "product" && offer.productId === productId),
    );
  };

  // Split products into recommended and special offers
  const recommendedProducts = products.slice(0, 4);
  const specialOfferProducts = products
    .filter(
      (product) => getProductOffers(product.id, product.salonId).length > 0,
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#ECE3DC]">
      {/* Header */}
      <header className="bg-[#ECE3DC]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              src="/probeauty-header-black.svg"
              alt="ProBeauty"
              width={150}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="bg-transparent hover:bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00] px-6 py-2 rounded-lg font-medium"
              onClick={() => router.push("/salons")}
            >
              Book Salon
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-gray-200"
              onClick={() => setShowCartDrawer(true)}
            >
              <ShoppingCart className="h-5 w-5 text-[#1e1e1e]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-gray-200"
              onClick={() => router.push("/")}
            >
              <X className="h-5 w-5 text-[#1e1e1e]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#ECE3DC] rounded-2xl p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1e1e1e]" />
              <Input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 h-12 rounded-xl focus:border-[#FF6A00] focus:ring-[#FF6A00] bg-[#ECE3DC] shadow-lg text-[#1e1e1e]"
              />
            </div>

            {/* Filter Icons */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl bg-[#ECE3DC] hover:bg-[#D4C4B4] text-[#1e1e1e] shadow-lg flex-shrink-0"
            >
              <Filter className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl bg-[#ECE3DC] hover:bg-[#D4C4B4] text-[#1e1e1e] shadow-lg flex-shrink-0"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Category Circles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-4 mb-8 overflow-x-auto pb-2 px-2 scrollbar-hide"
        >
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 transition-all pt-4 ${
                selectedCategory === category.id ? "scale-110" : ""
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                  selectedCategory === category.id
                    ? "bg-[#FF6A00] shadow-lg"
                    : "bg-[#ECE3DC] shadow-md"
                }`}
              >
                {category.icon}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {category.name}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Offers Carousel */}
        {carouselOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 flex flex-col items-center"
          >
            <div className="w-full max-w-2xl">
              <Card className="relative overflow-hidden border-4 border-[#1E1E1E] rounded-3xl bg-[#ECE3DC] hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden">
                    {carouselOffers[currentOfferIndex].image ? (
                      <img
                        src={carouselOffers[currentOfferIndex].image}
                        alt={carouselOffers[currentOfferIndex].title}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F44A01] to-[#FF6A00] flex items-center justify-center">
                        <Tag className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <Badge className="absolute top-4 right-4 bg-[#FF6A00] text-white border-0 font-bold text-base px-4 py-2 rounded-full">
                      {carouselOffers[currentOfferIndex].discountType ===
                      "percentage"
                        ? `Get ${carouselOffers[currentOfferIndex].discountValue}% off`
                        : `Get £${carouselOffers[currentOfferIndex].discountValue} off`}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Carousel Indicators */}
              {carouselOffers.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {carouselOffers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentOfferIndex(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentOfferIndex
                          ? "w-8 bg-[#FF6A00]"
                          : "w-2 bg-gray-300"
                      }`}
                      aria-label={`Go to offer ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recommended Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recommended</h3>
            <Button
              variant="ghost"
              className="text-[#000000] hover:text-orange-600 hover:bg-orange-50 font-medium"
            >
              <p className="text-[#000000]"> View All </p>
              <ArrowRight />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#ECE3DC] rounded-2xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {recommendedProducts.map((product, index) => {
                const productOffers = getProductOffers(
                  product.id,
                  product.salonId,
                );
                const hasOffers = productOffers.length > 0;
                const isAdded = addedItems.has(product.id);
                const isFavorite = isInWishlist(product.id);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="group"
                  >
                    <Card
                      className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-transparent p-4">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        {hasOffers && (
                          <div className="absolute top-6 left-6 z-10">
                            <Badge className="bg-gradient-to-r from-[#F44A01] to-[#FF6A00] text-white border-0 text-xs font-semibold shadow-md">
                              <Tag className="w-3 h-3 mr-1" />
                              {productOffers.length}{" "}
                              {productOffers.length === 1 ? "Offer" : "Offers"}
                            </Badge>
                          </div>
                        )}
                        {/* Wishlist Button - Top Right */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWishlist(product);
                          }}
                          className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md z-10 border border-gray-200"
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              isFavorite
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          />
                        </motion.button>
                      </div>
                      <CardContent className="p-3 flex flex-col grow">
                        <p className="text-xs text-[#F44A01] mb-1">
                          {product.brand}
                        </p>
                        <h3 className="text-sm text-[#1E1E1E] leading-tight line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-base font-bold text-[#1E1E1E]">
                            £{Number(product.finalPrice).toFixed(2)}
                          </span>
                          {product.originalPrice > product.finalPrice && (
                            <span className="text-xs text-gray-500 line-through">
                              £{Number(product.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={isAdded || !product.inStock}
                        className={`w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 font-medium text-xs ${
                          isAdded
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-[#1E1E1E] hover:bg-[#2a2a2a] text-[#ECE3DC]"
                        }`}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {isAdded ? "Added" : "Add to Cart"}
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Special Offers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Special offers</h3>
            <Button
              variant="ghost"
              className="text-[#000000] hover:text-orange-600 hover:bg-orange-50 font-medium"
            >
              <p className="text-[#000000]"> View All </p>
              <ArrowRight />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#ECE3DC] rounded-2xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {specialOfferProducts.length > 0 ? (
                specialOfferProducts.map((product, index) => {
                  const productOffers = getProductOffers(
                    product.id,
                    product.salonId,
                  );
                  const hasOffers = productOffers.length > 0;
                  const isAdded = addedItems.has(product.id);
                  const isFavorite = isInWishlist(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="group"
                    >
                      <Card
                        className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col cursor-pointer"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-transparent p-4">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          {hasOffers && (
                            <div className="absolute top-6 left-6 z-10">
                              <Badge className="bg-gradient-to-r from-[#F44A01] to-[#FF6A00] text-white border-0 text-xs font-semibold shadow-md">
                                <Tag className="w-3 h-3 mr-1" />
                                {productOffers.length}{" "}
                                {productOffers.length === 1
                                  ? "Offer"
                                  : "Offers"}
                              </Badge>
                            </div>
                          )}
                          {/* Wishlist Button - Top Right */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(product);
                            }}
                            className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md z-10 border border-gray-200"
                          >
                            <Heart
                              className={`h-4 w-4 transition-colors ${
                                isFavorite
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                            />
                          </motion.button>
                        </div>
                        <CardContent className="p-3 flex flex-col grow">
                          <p className="text-xs text-[#F44A01] mb-1">
                            {product.brand}
                          </p>
                          <h3 className="text-sm text-[#1E1E1E] leading-tight line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-base font-bold text-[#1E1E1E]">
                              £{Number(product.finalPrice).toFixed(2)}
                            </span>
                            {product.originalPrice > product.finalPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                £{Number(product.originalPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={isAdded || !product.inStock}
                          className={`w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 font-medium text-xs ${
                            isAdded
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-[#1E1E1E] hover:bg-[#2a2a2a] text-[#ECE3DC]"
                          }`}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          {isAdded ? "Added" : "Add to Cart"}
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No special offers available at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
      />
      <Footer />
    </div>
  );
}
