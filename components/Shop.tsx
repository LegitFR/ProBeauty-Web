"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { toast } from "sonner";
import { DisplayProduct } from "../lib/api/products";

interface ShopProps {
  apiProducts?: DisplayProduct[];
}

export function Shop({ apiProducts = [] }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addedItems, setAddedItems] = useState<Set<string | number>>(new Set());
  const [highlightedProductId, setHighlightedProductId] = useState<
    string | number | null
  >(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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
    const isFavorite = isInWishlist(product.id);

    if (isFavorite) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: product.id,
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

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "all" || product.category === selectedCategory;
    const searchMatch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <section
      id="shop"
      className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.h2
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 px-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <span className="block mb-2">Special Offers</span>
            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent bg-[length:400%_400%]">
              Beauty Products
            </span>
          </motion.h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
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
          className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 mb-12 sm:mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-center">
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-[#FF7A00] transition-colors" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00] bg-white/50 text-sm sm:text-base"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-200 bg-white/50 text-sm sm:text-base">
                <Filter className="h-4 w-4 mr-2" />
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

            <Button
              onClick={() =>
                toast.success("AI is finding the best deals for you...")
              }
              className="h-12 sm:h-14 bg-gradient-to-r from-[#FF7A00] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-sm sm:text-base"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">AI Recommendations</span>
              <span className="sm:hidden">AI Suggest</span>
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Products Grid - Matching the special offers design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {filteredProducts.map((product, index) => {
            const isAdded = addedItems.has(product.id);
            const isFavorite = isInWishlist(product.id);
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
                <Card className="h-full bg-transparent backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                  {/* Image Section - Matching your card design */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Wishlist Button - Top Right */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(product)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg z-10"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600 hover:text-red-500"
                        }`}
                      />
                    </motion.button>

                    {/* Discount Badge - Exactly matching your image */}
                    {product.isSpecialOffer && (
                      <div className="absolute top-4 left-4 bg-[#FF7A00] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {product.badge}
                      </div>
                    )}

                    {/* Quick Add Button - Bottom of image */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product)}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm shadow-lg"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2 inline" />
                      Quick Add
                    </motion.button>
                  </div>

                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Brand and Product Name */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">
                        {product.brand}
                      </p>
                      <CardTitle className="text-lg font-bold text-black leading-tight line-clamp-2 group-hover:text-[#FF7A00] transition-colors">
                        {product.name}
                      </CardTitle>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-[#FF7A00] text-[#FF7A00]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Price Section - Exactly matching your image layout */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-black">
                          ₹{product.finalPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        ({product.discount}% off)
                      </p>
                    </div>

                    {/* Enhanced Add to Cart Button - Matching your image style */}
                    <div className="mt-auto">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdded}
                        className={`w-full h-12 rounded-2xl transition-all duration-300 transform font-semibold ${
                          isAdded
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        } relative overflow-hidden group`}
                      >
                        <div className="relative z-10 flex items-center justify-center">
                          {isAdded ? (
                            <>
                              <Check className="h-5 w-5 mr-2" />
                              Added to Cart
                            </>
                          ) : (
                            <>Select Size</>
                          )}
                        </div>
                        {!isAdded && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced AI Recommendations Section */}
        <motion.div
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
        </motion.div>
      </div>
    </section>
  );
}
