/**
 * Server-side and Client-side Cart API functions
 * Uses Next.js API routes as a proxy to keep backend URL secure
 */

import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/cart";

export interface ApiCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    salonId: string;
    title: string;
    sku: string;
    price: string;
    quantity: number;
    images: string[];
  };
}

export interface ApiCart {
  id: string;
  userId: string;
  createdAt: string;
  cartItems: ApiCartItem[];
}

export interface CartResponse {
  message: string;
  data: {
    cart: ApiCart;
    summary: {
      totalItems: number;
      subtotal: number;
      itemCount: number;
    };
  };
}

export interface AddItemResponse {
  message: string;
  data: ApiCartItem;
}

/**
 * Get the current user's cart
 */
export async function getCart(token: string): Promise<CartResponse | null> {
  console.log("[Cart API] Fetching cart from:", API_BASE_URL);
  console.log(
    "[Cart API] Using token:",
    token ? `${token.substring(0, 20)}...` : "none",
  );

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("[Cart API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[Cart API] Cart doesn't exist yet (404)");
        return null;
      }
      const errorText = await response.text();
      console.error(`[Cart API] Error ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log("[Cart API] Success! Data:", data);
    return data;
  } catch (error) {
    console.error("[Cart API] Exception:", error);
    return null;
  }
}

/**
 * Add item to cart
 */
export async function addItemToCart(
  token: string,
  productId: string,
  quantity: number = 1,
): Promise<AddItemResponse | null> {
  try {
    return await fetchJsonWithAuth<AddItemResponse>(`${API_BASE_URL}/items`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  } catch (error: any) {
    console.error("Error adding item to cart:", error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  token: string,
  productId: string,
  quantity: number,
): Promise<AddItemResponse | null> {
  try {
    return await fetchJsonWithAuth<AddItemResponse>(
      `${API_BASE_URL}/items/${productId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      },
    );
  } catch (error: any) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeItemFromCart(
  token: string,
  productId: string,
): Promise<{ message: string } | null> {
  try {
    return await fetchJsonWithAuth<{ message: string }>(
      `${API_BASE_URL}/items/${productId}`,
      {
        method: "DELETE",
      },
    );
  } catch (error: any) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(
  token: string,
): Promise<{ message: string } | null> {
  try {
    return await fetchJsonWithAuth<{ message: string }>(`${API_BASE_URL}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}
