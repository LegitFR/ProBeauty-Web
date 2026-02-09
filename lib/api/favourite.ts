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
import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/favourites";

/**
 * Add a product to favourites
 * @param token - Authentication token
 * @param data - Product ID to add
 * @returns Promise with the created favourite
 */
export async function addToFavourites(
  token: string,
  data: AddToFavouritesData,
): Promise<SingleFavouriteResponse> {
  return await fetchJsonWithAuth<SingleFavouriteResponse>(API_BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
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
  limit = 10,
): Promise<FavouritesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return await fetchJsonWithAuth<FavouritesResponse>(
    `${API_BASE_URL}?${params}`,
    {
      method: "GET",
    },
  );
}

/**
 * Check if a product is in favourites
 * @param token - Authentication token
 * @param productId - Product ID to check
 * @returns Promise with favourite status
 */
export async function checkFavouriteStatus(
  token: string,
  productId: string,
): Promise<FavouriteStatusResponse> {
  return await fetchJsonWithAuth<FavouriteStatusResponse>(
    `${API_BASE_URL}/check/${productId}`,
    {
      method: "GET",
    },
  );
}

/**
 * Remove a product from favourites
 * @param token - Authentication token
 * @param productId - Product ID to remove
 * @returns Promise with success message
 */
export async function removeFromFavourites(
  token: string,
  productId: string,
): Promise<RemoveFavouriteResponse> {
  return await fetchJsonWithAuth<RemoveFavouriteResponse>(
    `${API_BASE_URL}/${productId}`,
    {
      method: "DELETE",
    },
  );
}
