/**
 * Reviews API Client Functions
 * Handles fetching and managing reviews
 */

import { Review, ReviewsResponse } from "@/lib/types/review";

const API_BASE_URL = "/api/reviews";

/**
 * Get reviews for a salon with average rating
 */
export async function getSalonReviews(
  salonId: string,
  page: number = 1,
  limit: number = 100,
): Promise<ReviewsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/salon/${salonId}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch salon reviews:", response.statusText);
      return {
        message: "Failed to fetch reviews",
        data: [],
        averageRating: 0,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching salon reviews:", error);
    return {
      message: "Error fetching reviews",
      data: [],
      averageRating: 0,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 100,
): Promise<ReviewsResponse> {
  try {
    const params = new URLSearchParams({
      productId,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch product reviews:", response.statusText);
      return {
        message: "Failed to fetch reviews",
        data: [],
        averageRating: 0,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return {
      message: "Error fetching reviews",
      data: [],
      averageRating: 0,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;

  return Math.round(average * 10) / 10; // Round to 1 decimal place
}
