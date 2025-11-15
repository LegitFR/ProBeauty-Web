/**
 * Cart API Client
 * Handles shopping cart operations including fetching, adding, updating, and removing items
 */

import { fetchWithAuth } from "./auth"
import type {
  GetCartResponse,
  AddToCartRequest,
  AddToCartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  RemoveFromCartResponse,
  ClearCartResponse,
} from "../types/cart"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || ""

/**
 * Get the current user's cart with all items
 */
export async function getCart(): Promise<GetCartResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart`, {
      method: "GET",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch cart")
    }

    return result
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred while fetching the cart"
    throw new Error(errorMessage)
  }
}

/**
 * Add an item to the cart
 * If the item already exists, the quantity will be incremented
 */
export async function addToCart(data: AddToCartRequest): Promise<AddToCartResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to add item to cart")
    }

    return result
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred while adding item to cart"
    throw new Error(errorMessage)
  }
}

/**
 * Update the quantity of a cart item
 */
export async function updateCartItem(
  productId: string,
  data: UpdateCartItemRequest
): Promise<UpdateCartItemResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/items/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to update cart item")
    }

    return result
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred while updating cart item"
    throw new Error(errorMessage)
  }
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(productId: string): Promise<RemoveFromCartResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/items/${productId}`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to remove item from cart")
    }

    return result
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while removing item from cart"
    throw new Error(errorMessage)
  }
}

/**
 * Clear all items from the cart
 */
export async function clearCart(): Promise<ClearCartResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/cart`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to clear cart")
    }

    return result
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred while clearing cart"
    throw new Error(errorMessage)
  }
}
