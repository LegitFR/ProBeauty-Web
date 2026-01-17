"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { DisplayProduct } from "../../lib/api/products";
import { CartProvider, useCart } from "../../components/CartContext";
import {
  WishlistProvider,
  useWishlist,
} from "../../components/WishlistContext";
import { AuthModal } from "../../components/AuthModal";
import { Toaster } from "../../components/Toaster";
import { toast } from "sonner";
import {
  Search,
  Heart,
  ShoppingCart,
  Star,
  Filter,
  X,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

/**
 * NOTE: Search Implementation
 *
 * The backend now provides a fuzzy search API endpoint (/api/v1/products/search)
 * with server-side filtering capabilities including:
 * - Fuzzy matching on product title and SKU
 * - Price range filtering (minPrice, maxPrice)
 * - Salon filtering (salonId)
 * - Stock availability filtering (inStock)
 * - Pagination support
 *
 * Current Implementation: Client-side filtering (simple, works with initial data)
 *
 * Future Enhancement: For better performance with large product catalogs, consider:
 * 1. Using searchProductsClient() from lib/api/products.ts for search queries
 * 2. Implementing debounced API calls on search input
 * 3. Showing loading states during search
 * 4. Server-side pagination for browsing large result sets
 *
 * Available functions in lib/api/products.ts:
 * - searchProductsClient({ q, minPrice, maxPrice, salonId, inStock, page, limit })
 * - fetchProductsClient({ minPrice, maxPrice, salonId, inStock, page, limit })
 */

interface ProductsClientProps {
  products: DisplayProduct[];
}

function ProductsContent({ products }: ProductsClientProps) {
  const router = useRouter();
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
  const {
    items: wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(cats)];
  }, [products]);

  // Check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter((p) => {
        if (priceRange === "under50") return p.finalPrice < 50;
        if (priceRange === "50-100")
          return p.finalPrice >= 50 && p.finalPrice <= 100;
        if (priceRange === "100-200")
          return p.finalPrice >= 100 && p.finalPrice <= 200;
        if (priceRange === "over200") return p.finalPrice > 200;
        return true;
      });
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.finalPrice - a.finalPrice);
    } else if (sortBy === "discount") {
      filtered.sort((a, b) => b.discount - a.discount);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const handleAddToCart = (product: DisplayProduct) => {
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

  const handleToggleWishlist = (product: DisplayProduct) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.finalPrice,
        originalPrice: product.originalPrice,
        image: product.image,
        brand: product.brand,
      });
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE3DC]">
      <Header />

      <main className="pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#F44A01] to-[#FF6A00] text-[#ECE3DC] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-[#ECE3DC]/90 hover:text-[#ECE3DC] mb-6 transition-colors font-['Poppins']"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 font-['Playfair_Display']">
                Discover Our Products
              </h1>
              <p className="text-lg sm:text-xl text-[#ECE3DC]/90 max-w-2xl font-['Poppins']">
                Premium beauty products curated just for you. Find your perfect
                match.
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm">
                <Badge className="bg-[#ECE3DC] text-[#F44A01] hover:bg-[#ECE3DC] px-4 py-2 font-['Poppins']">
                  {products.length} Products Available
                </Badge>
                <Badge className="bg-[#1E1E1E]/30 text-[#ECE3DC] hover:bg-[#1E1E1E]/40 px-4 py-2 font-['Poppins']">
                  Free Shipping
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search and Filters Section */}
        <section className="bg-[#ECE3DC] border-b border-[#CBCBCB] sticky top-16 sm:top-20 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search - Takes more space */}
              <div className="relative w-full sm:w-[30%]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#616161]" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 h-12 bg-[#ECE3DC] border-2 border-[#1E1E1E] focus:border-[#F44A01] focus:ring-[#F44A01] rounded-xl text-[#1E1E1E] placeholder:text-[#616161]"
                />
              </div>

              {/* Sort - Fixed width */}
              <div className="relative w-full sm:w-[30%]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-12 px-4 pr-10 bg-[#ECE3DC] border-2 border-[#1E1E1E] rounded-xl appearance-none focus:outline-none focus:border-[#F44A01] focus:ring-2 focus:ring-[#F44A01] cursor-pointer text-[#1E1E1E]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#616161] pointer-events-none" />
              </div>

              {/* Filter Toggle - Fixed width */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 w-full sm:w-[30%] border-2 border-[#1E1E1E] bg-[#ECE3DC] hover:border-[#F44A01] hover:bg-[#F44A01] hover:text-[#ECE3DC] text-[#1E1E1E] rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters && <X className="h-4 w-4 ml-2" />}
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-['Poppins']">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                          selectedCategory === cat
                            ? "bg-[#F44A01] text-[#ECE3DC] border-[#F44A01]"
                            : "bg-[#ECE3DC] text-[#1E1E1E] hover:bg-[#CBCBCB] border-[#1E1E1E]"
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-['Poppins']">
                    Price Range
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "under50", "50-100", "100-200", "over200"].map(
                      (range) => (
                        <button
                          key={range}
                          onClick={() => setPriceRange(range)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                            priceRange === range
                              ? "bg-[#F44A01] text-[#ECE3DC] border-[#F44A01]"
                              : "bg-[#ECE3DC] text-[#1E1E1E] hover:bg-[#CBCBCB] border-[#1E1E1E]"
                          }`}
                        >
                          {range === "all" && "All Prices"}
                          {range === "under50" && "Under £50"}
                          {range === "50-100" && "£50 - £100"}
                          {range === "100-200" && "£100 - £200"}
                          {range === "over200" && "Over £200"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Active Filters Summary */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-['Poppins']">
                    Active Filters
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#616161] font-['Poppins']">
                      {filteredProducts.length} of {products.length} products
                    </span>
                    {(selectedCategory !== "all" ||
                      priceRange !== "all" ||
                      searchQuery) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory("all");
                          setPriceRange("all");
                          setSearchQuery("");
                        }}
                        className="text-[#F44A01] hover:text-[#F44A01] hover:bg-[#F44A01]/10 rounded-xl"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-[#CBCBCB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-[#616161]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2 font-['Playfair_Display']">
                  No products found
                </h3>
                <p className="text-[#616161] mb-6 font-['Poppins']">
                  Try adjusting your filters or search query
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange("all");
                    setSearchQuery("");
                  }}
                  className="bg-[#F44A01] hover:bg-[#FF6A00] text-[#ECE3DC] rounded-xl font-['Poppins']"
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product, index) => {
                  const isAdded = addedItems.has(product.id);
                  const isFavorite = isInWishlist(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group h-full rounded-3xl"
                    >
                      <Card className="h-full bg-[#ECE3DC] border-4 border-[#1E1E1E] shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden flex flex-col">
                        {/* Image Section - Matching home page design */}
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
                            onClick={() => handleToggleWishlist(product)}
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
                        </div>

                        <CardContent className="p-2 flex flex-col flex-grow gap-y-2">
                          {/* Brand Name in Orange */}
                          <p className="font-normal text-[#F44A01] mb-0 text-xs">
                            {product.brand}
                          </p>

                          {/* Product Name */}
                          <h3 className="text-sm font-medium text-[#1E1E1E] leading-tight line-clamp-2 mb-1">
                            {product.name}
                          </h3>

                          {/* Price Section - Matching home page */}
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

                        {/* Add to Cart Button - At bottom edge-to-edge like home page */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdded || !product.inStock}
                          className={`w-full h-10 rounded-none rounded-b-[10px] transition-all duration-200 font-medium text-xs ${
                            isAdded
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-[#1E1E1E] hover:bg-[#2a2a2a] text-white"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Added
                            </>
                          ) : product.inStock ? (
                            "Add to Cart"
                          ) : (
                            "Out of Stock"
                          )}
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <Toaster />
    </div>
  );
}

export default function ProductsClient({ products }: ProductsClientProps) {
  return (
    <CartProvider>
      <WishlistProvider>
        <ProductsContent products={products} />
      </WishlistProvider>
    </CartProvider>
  );
}
