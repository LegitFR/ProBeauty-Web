"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  addToFavourites,
  getFavourites,
  removeFromFavourites,
} from "@/lib/api/favourite";
import type { Favourite } from "@/lib/types/favourite";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  brand: string;
  rating?: number;
  reviews?: number;
  sku?: string;
  quantity?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
  loadWishlist: () => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert API Favourite to WishlistItem
  const convertToWishlistItem = (favourite: Favourite): WishlistItem => {
    const product = favourite.product;
    return {
      id: product.id,
      name: product.title,
      price: parseFloat(product.price),
      image: product.images[0] || "",
      brand: product.salon.name,
      sku: product.sku,
      quantity: product.quantity,
    };
  };

  // Load wishlist from API
  const loadWishlist = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getFavourites(token, 1, 100); // Load all favourites
      const wishlistItems = response.data.map(convertToWishlistItem);
      setItems(wishlistItems);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      // Don't show error toast on initial load
    } finally {
      setIsLoading(false);
    }
  };

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const addToWishlist = async (product: WishlistItem) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    try {
      await addToFavourites(token, { productId: product.id });
      setItems((current) => {
        const exists = current.find((item) => item.id === product.id);
        if (exists) {
          return current;
        }
        return [...current, product];
      });
      toast.success("Added to wishlist");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add to wishlist";
      toast.error(message);
    }
  };

  const removeFromWishlist = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to remove items from wishlist");
      return;
    }

    try {
      await removeFromFavourites(token, id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Removed from wishlist");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove from wishlist";
      toast.error(message);
    }
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        getTotalItems,
        loadWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
