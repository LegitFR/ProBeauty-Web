"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  addToFavourites,
  getFavourites,
  removeFromFavourites,
} from "@/lib/api/favourite";
import type { Favourite } from "@/lib/types/favourite";
import { toast } from "sonner";
import {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  getUser,
} from "@/lib/api/auth";

export interface WishlistItem {
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

export interface SalonWishlistItem {
  id: string;
  name: string;
  address: string;
  image: string;
  verified: boolean;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;

  salonItems: SalonWishlistItem[];
  addSalonToWishlist: (salon: SalonWishlistItem) => Promise<void>;
  removeSalonFromWishlist: (id: string) => Promise<void>;
  isSalonInWishlist: (id: string) => boolean;

  clearWishlist: () => void;
  getTotalItems: () => number;
  loadWishlist: () => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [salonItems, setSalonItems] = useState<SalonWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert API Favourite to WishlistItem
  const convertToWishlistItem = (favourite: Favourite): WishlistItem => {
    const productFav = favourite as any; 
    const product = productFav.product;
    return {
      id: product.id,
      name: product.title,
      price: parseFloat(product.price),
      image: product.images[0] || "",
      brand: product.salon?.name || "",
      sku: product.sku,
      quantity: product.quantity,
    };
  };

  // Convert API Favourite to SalonWishlistItem
  const convertToSalonWishlistItem = (favourite: Favourite): SalonWishlistItem => {
    const salonFav = favourite as any;
    const salon = salonFav.salon;
    return {
      id: salon.id,
      name: salon.name,
      address: salon.address,
      image: salon.thumbnail || (salon.images && salon.images[0]) || "",
      verified: salon.verified || false,
    };
  };

  // Load wishlist from API
  const loadWishlist = useCallback(async () => {
    let token = getAccessToken();
    const user = getUser();
    const refreshToken = getRefreshToken();

    if (!token && user && refreshToken) {
      try {
        const result = await refreshAccessToken(refreshToken);
        if (result.accessToken) {
          token = result.accessToken;
        }
      } catch {
        setItems([]);
        setSalonItems([]);
        return;
      }
    }

    if (!token) {
      setItems([]);
      setSalonItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const PAGE_LIMIT = 10;
      
      // Load Products
      let page = 1;
      let totalPages = 1;
      const allProducts: Favourite[] = [];
      do {
        const response = await getFavourites(token, "product", page, PAGE_LIMIT);
        allProducts.push(...response.data);
        totalPages = response.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);
      setItems(allProducts.map(convertToWishlistItem));

      // Load Salons
      page = 1;
      totalPages = 1;
      const allSalons: Favourite[] = [];
      do {
        const response = await getFavourites(token, "salon", page, PAGE_LIMIT);
        allSalons.push(...response.data);
        totalPages = response.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);
      setSalonItems(allSalons.map(convertToSalonWishlistItem));

    } catch (error) {
      console.error("[WishlistContext] Failed to load wishlists:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // -- Product methods --
  const addToWishlist = async (product: WishlistItem) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    try {
      await addToFavourites(token, { type: "product", itemId: product.id });
      setItems((current) => {
        if (current.find((item) => item.id === product.id)) return current;
        return [...current, product];
      });
      toast.success("Added to wishlist");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add to wishlist";
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
      await removeFromFavourites(token, id, "product");
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Removed from wishlist");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove from wishlist";
      toast.error(message);
    }
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  // -- Salon methods --
  const addSalonToWishlist = async (salon: SalonWishlistItem) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to add salons to wishlist");
      return;
    }

    try {
      await addToFavourites(token, { type: "salon", itemId: salon.id });
      setSalonItems((current) => {
        if (current.find((item) => item.id === salon.id)) return current;
        return [...current, salon];
      });
      toast.success("Salon added to wishlist");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add salon to wishlist";
      toast.error(message);
    }
  };

  const removeSalonFromWishlist = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to remove salons from wishlist");
      return;
    }

    try {
      await removeFromFavourites(token, id, "salon");
      setSalonItems((current) => current.filter((item) => item.id !== id));
      toast.success("Salon removed from wishlist");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove salon from wishlist";
      toast.error(message);
    }
  };

  const isSalonInWishlist = (id: string) => {
    return salonItems.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    setItems([]);
    setSalonItems([]);
  };

  const getTotalItems = () => {
    return items.length + salonItems.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        salonItems,
        addSalonToWishlist,
        removeSalonFromWishlist,
        isSalonInWishlist,
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
