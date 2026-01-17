"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ShoppingCart,
  Star,
  Filter,
  Search,
  Heart,
  Check,
  Sparkles,
  Zap,
  Tag,
  Camera,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { AuthModal } from "./AuthModal";
import { toast } from "sonner";
import {
  DisplayProduct,
  fetchProductsClient,
  transformProducts,
} from "../lib/api/products";
import { navigationActions } from "./ScrollManager";

export function Shop() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedItems, setAddedItems] = useState<Set<string | number>>(new Set());
  const [highlightedProductId, setHighlightedProductId] = useState<
    string | number | null
  >(null);
  const [apiProducts, setApiProducts] = useState<DisplayProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProductsClient({ limit: 50 });
        const transformedProducts = transformProducts(products);
        setApiProducts(transformedProducts);
      } catch (error) {
        console.error("Failed to load products:", error);
        // Keep loading state to show skeleton
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const handleHighlightProduct = (event: any) => {
      const { productId } = event.detail;
      setHighlightedProductId(productId);

      // First, ensure the Shop section is visible
      const scrollToShopSection = () => {
        const shopSection = document.getElementById("shop");
        if (shopSection) {
          shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      // Then scroll to the specific product card
      const scrollToProduct = () => {
        const productElement = document.getElementById(`product-${productId}`);
        if (productElement) {
          const headerOffset = 100; // Account for fixed header
          const elementPosition = productElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        } else {
          console.log(`Product element not found: product-${productId}`);
        }
      };

      // Step 1: Navigate to shop section first
      setTimeout(scrollToShopSection, 200);

      // Step 2: Multiple scroll attempts to the specific product
      setTimeout(scrollToProduct, 1000);
      setTimeout(scrollToProduct, 1600);
      setTimeout(scrollToProduct, 2200);

      // Remove highlight after animation
      setTimeout(() => {
        setHighlightedProductId(null);
      }, 4000);
    };

    window.addEventListener("highlightProduct", handleHighlightProduct);
    return () =>
      window.removeEventListener("highlightProduct", handleHighlightProduct);
  }, []);

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      setShowAuthModal(true);
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

  const toggleFavorite = (product: any) => {
    const productId = String(product.id);
    const isFavorite = isInWishlist(productId);

    if (isFavorite) {
      removeFromWishlist(productId);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        price: product.finalPrice,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image,
        brand: product.brand,
        rating: product.rating,
        reviews: product.reviews,
      });
      toast.success("Added to wishlist");
    }
  };

  const handleViewAll = () => {
    // Check if user is logged in
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!userStr) {
      // User not logged in, show auth modal
      toast.info("Please login to view all products");
      navigationActions.login();
    } else {
      // User logged in, navigate to products page
      router.push("/products");
    }
  };

  const categories = [
    { id: "all", name: "All Products", icon: "🛍️" },
    { id: "skincare", name: "Skincare", icon: "✨" },
    { id: "haircare", name: "Hair Care", icon: "💁" },
    { id: "makeup", name: "Makeup", icon: "💄" },
    { id: "tools", name: "Beauty Tools", icon: "🔧" },
    { id: "wellness", name: "Wellness", icon: "🌿" },
  ];

  // Fallback products (used when API products are not available)
  const fallbackProducts = [
    {
      id: 1,
      name: "De Fabulous Marula Oil Shampoo with Quinoa ultimate...",
      brand: "De Fabulous",
      category: "haircare",
      originalPrice: 1620,
      finalPrice: 1490,
      discount: 8,
      rating: 4.8,
      reviews: 245,
      image:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwc2hhbXBvbyUyMGJvdHRsZXxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "8% off",
      description:
        "Nourishing shampoo with marula oil and quinoa for ultimate hair repair",
      inStock: true,
    },
    {
      id: 2,
      name: "GK Hair Moisturizing Color Protection Conditioner (300ml)",
      brand: "GK Hair",
      category: "haircare",
      originalPrice: 2150,
      finalPrice: 1827,
      discount: 15,
      rating: 4.9,
      reviews: 189,
      image:
        "https://images.unsplash.com/photo-1526947425960-945c6e72858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY29uZGl0aW9uZXJ8ZW58MXx8fHwxNzU3OTE5OTU1fDA&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "15% off",
      description: "Professional color protection conditioner for vibrant hair",
      inStock: true,
    },
    {
      id: 3,
      name: "Vitamin C Brightening Face Serum",
      brand: "Glow Secrets",
      category: "skincare",
      originalPrice: 899,
      finalPrice: 679,
      discount: 24,
      rating: 4.7,
      reviews: 156,
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWluJTIwYyUyMHNlcnVtfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "24% off",
      description: "Brightening serum with vitamin C for radiant skin",
      inStock: true,
    },
    {
      id: 4,
      name: "Hydrating Hyaluronic Acid Moisturizer",
      brand: "AquaGlow",
      category: "skincare",
      originalPrice: 1299,
      finalPrice: 974,
      discount: 25,
      rating: 4.6,
      reviews: 298,
      image:
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2lzdHVyaXplciUyMGNyZWFtfGVufDF8fHx8MTc1NzkxOTk1NXww&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "25% off",
      description: "Deep hydration moisturizer with hyaluronic acid",
      inStock: true,
    },
    {
      id: 5,
      name: "Professional Makeup Brush Set",
      brand: "ProBeauty Tools",
      category: "tools",
      originalPrice: 2499,
      finalPrice: 1874,
      discount: 25,
      rating: 4.8,
      reviews: 203,
      image:
        "https://images.unsplash.com/photo-1583241800098-d53a4d6d1b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBicnVzaCUyMHNldHxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "25% off",
      description: "Professional makeup brush set with travel case",
      inStock: true,
    },
    {
      id: 6,
      name: "Nourishing Hair Mask Treatment",
      brand: "HairLux",
      category: "haircare",
      originalPrice: 799,
      finalPrice: 639,
      discount: 20,
      rating: 4.5,
      reviews: 167,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwbWFzayUyMHRyZWF0bWVudHxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "20% off",
      description: "Deep nourishing hair mask for damaged hair repair",
      inStock: true,
    },
    {
      id: 7,
      name: "Retinol Anti-Aging Night Cream",
      brand: "YouthGlow",
      category: "skincare",
      originalPrice: 1899,
      finalPrice: 1424,
      discount: 25,
      rating: 4.7,
      reviews: 312,
      image:
        "https://images.unsplash.com/photo-1556228577-dd4de3810c2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRpbm9sJTIwY3JlYW18ZW58MXx8fHwxNzU3OTE5OTU1fDA&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "25% off",
      description: "Anti-aging night cream with retinol for youthful skin",
      inStock: true,
    },
    {
      id: 8,
      name: "Long-Lasting Matte Lipstick Set",
      brand: "ColorPop Pro",
      category: "makeup",
      originalPrice: 1599,
      finalPrice: 1199,
      discount: 25,
      rating: 4.6,
      reviews: 189,
      image:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXBzdGljayUyMHNldHxlbnwxfHx8fDE3NTc5MTk5NTV8MA&ixlib=rb-4.0&q=80&w=1080",
      isSpecialOffer: true,
      badge: "25% off",
      description: "Long-lasting matte lipstick set in 6 gorgeous shades",
      inStock: true,
    },
  ];

  // Use API products if available, otherwise use fallback products
  const products = apiProducts.length > 0 ? apiProducts : fallbackProducts;

  const filteredProducts = products
    .filter((product) => {
      const categoryMatch =
        selectedCategory === "all" || product.category === selectedCategory;
      const searchMatch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    })
    .slice(0, 4); // Show only first 4 products

  return (
    <section
      id="shop"
      className="py-12 sm:py-16 lg:py-24 bg-[#ECE3DC] overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 overflow-hidden">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.h2
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black mb-4 sm:mb-6 px-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <span className="mr-4">Special Offers</span>
            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent bg-[length:400%_400%]">
              Beauty Products
            </span>
          </motion.h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 py-10">
            Discover premium beauty products with AI-powered recommendations and
            exclusive offers curated just for you
          </p>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#ECE3DC] backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 mb-12 sm:mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-stretch">
            <div className="relative group flex">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#1e1e1e] group-focus-within:text-[#FF7A00] transition-colors z-10" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[#1E1E1E] focus:border-[#F44A01] focus:ring-[#F44A01] bg-transparent text-sm sm:text-base placeholder:text-[#1e1e1e]"
              />
            </div>

            <div className="flex">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-[#1E1E1E] bg-transparent text-sm sm:text-base">
                  <Filter className="h-4 w-4 mr-2 text-[#1e1e1e]" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() =>
                toast.success("AI is finding the best deals for you...")
              }
              className="h-12 sm:h-14 bg-gradient-to-r from-[#F44A01] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-sm sm:text-base w-full"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="">AI Suggestions</span>
            </Button>
          </div>
        </motion.div>

        {/* View All Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={handleViewAll}
            variant="ghost"
            className="text-[#000000] hover:text-orange-600 hover:bg-orange-50 font-medium"
          >
            <p className="text-[#000000]"> View All </p>
            <ArrowRight />
          </Button>
        </div>

        {/* Products Grid - Responsive layout */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] rounded-xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 p-4 animate-pulse">
                  <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                </div>
                <CardContent className="p-2 flex flex-col flex-grow gap-y-2">
                  <div className="h-3 bg-gray-300 rounded animate-pulse w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="h-3 bg-gray-300 rounded animate-pulse w-16"></div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <div className="h-5 bg-gray-300 rounded animate-pulse w-20"></div>
                  </div>
                  <div className="h-9 bg-gray-300 rounded-lg animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-4">
            {filteredProducts.map((product, index) => {
              const productId = String(product.id);
              const isAdded = addedItems.has(product.id);
              const isFavorite = isInWishlist(productId);
              const isHighlighted = highlightedProductId === product.id;

              return (
                <motion.div
                  key={product.id}
                  id={`product-${product.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  animate={{
                    backgroundColor: isHighlighted
                      ? [
                          "rgba(255, 255, 255, 0.9)",
                          "rgba(255, 122, 0, 0.15)",
                          "rgba(255, 255, 255, 0.9)",
                        ]
                      : "rgba(255, 255, 255, 0.9)",
                    boxShadow: isHighlighted
                      ? [
                          "0 10px 30px rgba(0, 0, 0, 0.1)",
                          "0 20px 60px rgba(255, 122, 0, 0.3)",
                          "0 10px 30px rgba(0, 0, 0, 0.1)",
                        ]
                      : "0 10px 30px rgba(0, 0, 0, 0.1)",
                    y: isHighlighted ? [0, -4, 0] : 0,
                    scale: isHighlighted ? [1, 1.03, 1] : 1,
                  }}
                  transition={{
                    duration: isHighlighted ? 0.8 : 0.6,
                    delay: isHighlighted ? 0 : index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="group h-full rounded-3xl"
                >
                  <Card className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col">
                    {/* Image Section - Matching reference design */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-transparent p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
                      />

                      {/* Wishlist Button - Top Right */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite(product)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10 border border-gray-200"
                      >
                        <Heart
                          className={`h-3 w-3 transition-colors ${
                            isFavorite
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      </motion.button>

                      {/* Discount Badge - Matching reference image */}
                      {/* {product.isSpecialOffer && (
                      <div className="absolute bottom-2 left-2 bg-[#F44A01] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {product.badge}
                      </div>
                    )} */}
                    </div>

                    <CardContent className="p-2 flex flex-col flex-grow gap-y-2">
                      {/* Brand Name in Orange */}
                      <p className="font-normal text-[#F44A01] mb-0 text-xs">
                        {product.brand}
                      </p>

                      {/* Product Name */}
                      <CardTitle className="text-sm font-medium text-[#1E1E1E] leading-tight line-clamp-2 mb-1">
                        {product.name}
                      </CardTitle>

                      {/* Price Section - Matching reference image */}
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-md font-body font-medium text-[#1E1E1E]">
                          £{product.finalPrice.toLocaleString()}
                        </span>
                        {/* Commented out until salon owners decide on offers */}
                        {/* <span className="text-md text-[#616161] line-through">
                          £{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-[#1E1E1E] font-normal">
                          ({product.discount}% off)
                        </span> */}
                      </div>
                    </CardContent>

                    {/* Add to Cart Button - At bottom edge-to-edge like reference */}
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdded}
                      className={`w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 font-medium text-xs ${
                        isAdded
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-[#1E1E1E] hover:bg-[#2a2a2a] text-white"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Added
                        </>
                      ) : (
                        "Add to Cart"
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Enhanced AI Recommendations Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 p-12 bg-gradient-to-r from-[#FF6A00]/10 via-orange-100/50 to-red-100/30 rounded-3xl backdrop-blur-sm border border-white/20"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block text-6xl mb-6"
            >
              🤖
            </motion.div>
            <h3 className="font-display text-3xl font-bold text-black mb-4">
              AI-Powered Beauty Recommendations
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our advanced AI analyzes your skin type, preferences, and beauty
              goals to curate personalized product recommendations just for you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#FF7A00] hover:bg-[#e66900] text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Get My Recommendations
              </Button>
              <Button
                variant="outline"
                className="border-2 border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white px-8 py-4 rounded-2xl transition-all duration-300"
              >
                <Camera className="h-5 w-5 mr-2" />
                Skin Analysis Scan
              </Button>
            </div>
          </div>
        </motion.div> */}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </section>
  );
}
