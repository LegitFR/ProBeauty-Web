/**
 * Favourite/Wishlist API Client Functions
 * Handles favourite management for products
 */

import {
  FavouritesResponse,
  SingleFavouriteResponse,
  FavouriteStatusResponse,
  RemoveFavouriteResponse,
  AddToFavouritesData,
} from "@/lib/types/favourite";

const API_BASE_URL = "/api/favourites";

/**
 * Add a product to favourites
 * @param token - Authentication token
 * @param data - Product ID to add
 * @returns Promise with the created favourite
 */
export async function addToFavourites(
  token: string,
  data: AddToFavouritesData
): Promise<SingleFavouriteResponse> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to add to favourites",
    }));
    throw new Error(error.message || "Failed to add to favourites");
  }

  return response.json();
}

/**
 * Get user's favourites with pagination
 * @param token - Authentication token
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with favourites and pagination
 */
export async function getFavourites(
  token: string,
  page = 1,
  limit = 10
): Promise<FavouritesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch favourites",
    }));
    throw new Error(error.message || "Failed to fetch favourites");
  }

  return response.json();
}

/**
 * Check if a product is in favourites
 * @param token - Authentication token
 * @param productId - Product ID to check
 * @returns Promise with favourite status
 */
export async function checkFavouriteStatus(
  token: string,
  productId: string
): Promise<FavouriteStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/check/${productId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to check favourite status",
    }));
    throw new Error(error.message || "Failed to check favourite status");
  }

  return response.json();
}

/**
 * Remove a product from favourites
 * @param token - Authentication token
 * @param productId - Product ID to remove
 * @returns Promise with success message
 */
export async function removeFromFavourites(
  token: string,
  productId: string
): Promise<RemoveFavouriteResponse> {
  const response = await fetch(`${API_BASE_URL}/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to remove from favourites",
    }));
    throw new Error(error.message || "Failed to remove from favourites");
  }

  return response.json();
}
