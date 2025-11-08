"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Menu, X, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import {
  navigationActions,
  setAuthModalHandlers,
  setCartDrawerHandlers,
} from "./ScrollManager";
import { AuthModal } from "./AuthModal";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import logoImage from "@/public/c47ce653b66f9a1b6cef07bf4525cc7986e0af24.png";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  const { items } = useCart();
  const { getTotalItems: getWishlistTotal } = useWishlist();

  useEffect(() => {
    // Check initial scroll position
    setIsScrolled(window.scrollY > 50);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setAuthModalHandlers({
      isOpen: showAuthModal,
      defaultTab: "login",
      onOpen: (tab) => setShowAuthModal(true),
      onClose: () => setShowAuthModal(false),
    });

    setCartDrawerHandlers({
      isOpen: showCartDrawer,
      onOpen: () => setShowCartDrawer(true),
      onClose: () => setShowCartDrawer(false),
    });
  }, [showAuthModal, showCartDrawer]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItems = getWishlistTotal();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/95 backdrop-blur-md border-b border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Smaller, cleaner */}
            <div className="flex items-center">
              <img
                src={logoImage.src}
                alt="ProBeauty"
                className="h-6 sm:h-7 w-auto"
              />
            </div>

            {/* Desktop Navigation - Clean and minimal */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <a
                href="#book"
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium font-normal"
              >
                List Your Business
              </a>
              <div className="w-px h-4 bg-gray-700"></div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                Log in
              </button>
              <button
                onClick={() => setShowWishlistDrawer(true)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors group"
              >
                <Heart
                  className={`h-5 w-5 transition-all ${
                    wishlistItems > 0 ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {wishlistItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs min-w-[1rem] h-4 flex items-center justify-center">
                    {wishlistItems}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setShowCartDrawer(true)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs min-w-[1rem] h-4 flex items-center justify-center">
                    {totalItems}
                  </Badge>
                )}
              </button>
              <Button
                onClick={() => navigationActions.shop()}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowWishlistDrawer(true)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <Heart
                  className={`h-5 w-5 transition-all ${
                    wishlistItems > 0 ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {wishlistItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs min-w-[1rem] h-4 flex items-center justify-center">
                    {wishlistItems}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setShowCartDrawer(true)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs min-w-[1rem] h-4 flex items-center justify-center">
                    {totalItems}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden bg-black/95 backdrop-blur-md border-t border-gray-800">
              <div className="px-4 py-4 space-y-3">
                <a
                  href="#shop"
                  className="block text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Shop
                </a>
                <a
                  href="#book"
                  className="block text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Salons
                </a>
                <div className="border-t border-gray-700 pt-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-white transition-colors text-sm font-medium mb-3"
                  >
                    Log in
                  </button>
                  <Button
                    onClick={() => {
                      navigationActions.shop();
                      setIsOpen(false);
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
      />
      <WishlistDrawer
        isOpen={showWishlistDrawer}
        onClose={() => setShowWishlistDrawer(false)}
      />
    </>
  );
}
