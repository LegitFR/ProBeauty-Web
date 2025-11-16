"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Settings,
} from "lucide-react";
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
import { getUser, logout } from "@/lib/api/auth";
import Link from "next/link";
import logoImage from "@/public/c47ce653b66f9a1b6cef07bf4525cc7986e0af24.png";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { items } = useCart();
  const { getTotalItems: getWishlistTotal } = useWishlist();

  // Check if we're on a page that needs solid background
  const needsSolidBg = pathname !== "/";

  useEffect(() => {
    // Check if user is logged in
    const userData = getUser();
    setUser(userData);
  }, []);

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowUserMenu(false);
    window.location.href = "/";
  };

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
          isScrolled || needsSolidBg
            ? "bg-black/95 backdrop-blur-md border-b border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - Smaller, cleaner */}
            <Link href="/">
              <div className="flex items-center">
                <img
                  src={logoImage.src}
                  alt="ProBeauty"
                  className="h-6 sm:h-7 w-auto"
                />
              </div>
            </Link>

            {/* Desktop Navigation - Clean and minimal */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <a
                href="#book"
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium font-normal"
              >
                List Your Business
              </a>
              <div className="w-px h-4 bg-gray-700"></div>

              {/* Show user menu or login button */}
              {user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link href="/profile">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </button>
                      </Link>
                      {/* <Link href="/profile/settings">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </button>
                      </Link> */}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Log in
                </button>
              )}

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
                {/* User Info in Mobile Menu */}
                {user && (
                  <div className="pb-3 border-b border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {user.name}
                        </p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/profile">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </button>
                    </Link>
                  </div>
                )}

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
                  {user ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left text-orange-400 hover:text-orange-600 transition-colors text-sm font-medium mb-3 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="block w-full text-left text-gray-300 hover:text-white transition-colors text-sm font-medium mb-3"
                    >
                      Log in
                    </button>
                  )}
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
