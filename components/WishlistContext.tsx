import { createContext, useContext, useState, ReactNode } from "react";

interface WishlistItem {
  id: string | number; // Support both string (API) and number (fallback)
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  brand: string;
  rating?: number;
  reviews?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: string | number) => void;
  isInWishlist: (id: string | number) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addToWishlist = (product: WishlistItem) => {
    setItems((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        return current;
      }
      return [...current, product];
    });
  };

  const removeFromWishlist = (id: string | number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const isInWishlist = (id: string | number) => {
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
