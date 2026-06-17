/**
 * Favourite/Wishlist API Client Functions
 * Handles favourite management for products and salons
 */

import {
  FavouritesResponse,
  SingleFavouriteResponse,
  FavouriteStatusResponse,
  RemoveFavouriteResponse,
  AddToFavouritesData,
} from "@/lib/types/favourite";
import { fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/favourites";

/**
 * Add an item to favourites
 * @param token - Authentication token
 * @param data - The type and ID to add
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
 * @param type - The type of favourites to fetch ("product" or "salon")
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with favourites and pagination
 */
export async function getFavourites(
  token: string,
  type: "product" | "salon",
  page?: number,
  limit?: number,
): Promise<FavouritesResponse> {
  const params = new URLSearchParams();

  params.set("type", type);

  if (page !== undefined) {
    params.set("page", page.toString());
  }

  if (limit !== undefined) {
    params.set("limit", limit.toString());
  }

  const url = `${API_BASE_URL}?${params.toString()}`;

  return await fetchJsonWithAuth<FavouritesResponse>(url, {
    method: "GET",
  });
}

/**
 * Check if an item is in favourites
 * @param token - Authentication token
 * @param id - Item ID to check
 * @param type - "product" or "salon"
 * @returns Promise with favourite status
 */
export async function checkFavouriteStatus(
  token: string,
  id: string,
  type: "product" | "salon",
): Promise<FavouriteStatusResponse> {
  return await fetchJsonWithAuth<FavouriteStatusResponse>(
    `${API_BASE_URL}/check/${id}?type=${type}`,
    {
      method: "GET",
    },
  );
}

/**
 * Remove an item from favourites
 * @param token - Authentication token
 * @param id - Item ID to remove
 * @param type - "product" or "salon"
 * @returns Promise with success message
 */
export async function removeFromFavourites(
  token: string,
  id: string,
  type: "product" | "salon",
): Promise<RemoveFavouriteResponse> {
  return await fetchJsonWithAuth<RemoveFavouriteResponse>(
    `${API_BASE_URL}/${id}?type=${type}`,
    {
      method: "DELETE",
    },
  );
}
