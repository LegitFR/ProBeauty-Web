import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart as clearApiCart,
  type CartResponse,
  type ApiCartItem,
} from "@/lib/api/cart";

interface CartItem {
  id: string | number; // Support both string (API) and number (fallback)
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncCartWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Token is stored separately as "accessToken" in localStorage
        const accessToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (accessToken && userStr) {
          setToken(accessToken);
          setIsAuthenticated(true);
          console.log("[CartContext] ✅ User authenticated");
          return;
        }
      } catch (error) {
        console.error("[CartContext] Auth check error:", error);
      }
      console.log("[CartContext] ⚠️ User not authenticated");
      setToken(null);
      setIsAuthenticated(false);
      setItems([]); // Clear cart on logout
    };

    checkAuth();

    // Listen for storage changes (login/logout events)
    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);

    // Listen for auth-expired event from auth error handler
    const handleAuthExpired = () => {
      console.log("[CartContext] Auth expired event received, clearing cart");
      setToken(null);
      setIsAuthenticated(false);
      setItems([]);
    };
    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  // Load cart from API when authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && token) {
        try {
          const cartResponse = await getCart(token);
          if (cartResponse?.data?.cart?.cartItems) {
            // Transform API cart items to match CartItem interface
            const transformedItems: CartItem[] =
              cartResponse.data.cart.cartItems.map((item: ApiCartItem) => ({
                id: item.product.id || item.productId,
                name: item.product.title,
                price: parseFloat(item.product.price),
                image: item.product.images?.[0] || "/placeholder.png",
                quantity: item.quantity,
              }));
            setItems(transformedItems);
          }
        } catch (error) {
          console.error("[CartContext] Failed to load cart:", error);
          // Keep local cart if API fails
        }
      } else {
        // Load from localStorage when not authenticated
        try {
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            setItems(JSON.parse(localCart));
          }
        } catch (error) {
          console.error("[CartContext] Failed to load local cart:", error);
        }
      }
    };

    loadCart();
  }, [isAuthenticated, token]);

  // Save to localStorage when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  // Sync local cart to backend when user logs in
  const syncCartWithBackend = async () => {
    if (!isAuthenticated || !token || items.length === 0) return;

    try {
      // Add all local items to backend cart
      for (const item of items) {
        await addItemToCart(token, String(item.id), item.quantity);
      }
      // Reload cart from backend to get latest state
      const cartResponse = await getCart(token);
      if (cartResponse?.data?.cart?.cartItems) {
        const transformedItems: CartItem[] =
          cartResponse.data.cart.cartItems.map((item: ApiCartItem) => ({
            id: item.product.id || item.productId,
            name: item.product.title,
            price: parseFloat(item.product.price),
            image: item.product.images?.[0] || "/placeholder.png",
            quantity: item.quantity,
          }));
        setItems(transformedItems);
      }
    } catch (error) {
      console.error("[CartContext] Failed to sync cart:", error);
    }
  };

  const addToCart = async (product: Omit<CartItem, "quantity">) => {
    if (isAuthenticated && token) {
      // Use API when authenticated
      try {
        await addItemToCart(token, String(product.id), 1);
        // Update local state
        setItems((current) => {
          const existingItem = current.find((item) => item.id === product.id);
          if (existingItem) {
            return current.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...current, { ...product, quantity: 1 }];
        });
      } catch (error) {
        console.error("[CartContext] Failed to add to cart:", error);
        throw error;
      }
    } else {
      // Use localStorage when not authenticated
      setItems((current) => {
        const existingItem = current.find((item) => item.id === product.id);
        if (existingItem) {
          return current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...current, { ...product, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (id: string | number) => {
    if (isAuthenticated && token) {
      // Use API when authenticated
      try {
        await removeItemFromCart(token, String(id));
        setItems((current) => current.filter((item) => item.id !== id));
      } catch (error) {
        console.error("[CartContext] Failed to remove from cart:", error);
        throw error;
      }
    } else {
      // Use localStorage when not authenticated
      setItems((current) => current.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    if (isAuthenticated && token) {
      // Use API when authenticated
      try {
        await updateCartItem(token, String(id), quantity);
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
      } catch (error) {
        console.error("[CartContext] Failed to update quantity:", error);
        throw error;
      }
    } else {
      // Use localStorage when not authenticated
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && token) {
      // Use API when authenticated
      try {
        await clearApiCart(token);
        setItems([]);
      } catch (error) {
        console.error("[CartContext] Failed to clear cart:", error);
        throw error;
      }
    } else {
      // Use localStorage when not authenticated
      setItems([]);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        syncCartWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
