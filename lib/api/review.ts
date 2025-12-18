/**
 * Review API Client Functions
 * Handles review management for salons, services, and products
 */

import {
  Review,
  CreateReviewData,
  UpdateReviewData,
  ReviewsResponse,
  SingleReviewResponse,
} from "@/lib/types/review";

const API_BASE_URL = "/api/reviews";

/**
 * Create a new review for a salon/service/product
 * @param token - Authentication token
 * @param data - Review data
 * @returns Promise with the created review
 */
export async function createReview(
  token: string,
  data: CreateReviewData
): Promise<SingleReviewResponse> {
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
      message: "Failed to create review",
    }));
    throw new Error(error.message || "Failed to create review");
  }

  return response.json();
}

/**
 * Get a single review by ID
 * @param id - Review ID
 * @returns Promise with the review
 */
export async function getReviewById(id: string): Promise<SingleReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch review",
    }));
    throw new Error(error.message || "Failed to fetch review");
  }

  return response.json();
}

/**
 * Get all reviews for a specific salon
 * @param salonId - Salon ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with reviews, average rating, and pagination
 */
export async function getReviewsBySalon(
  salonId: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/salon/${salonId}?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch reviews",
    }));
    throw new Error(error.message || "Failed to fetch reviews");
  }

  return response.json();
}

/**
 * Get all reviews created by the authenticated user
 * @param token - Authentication token
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with user's reviews and pagination
 */
export async function getMyReviews(
  token: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/user/me?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch reviews",
    }));
    throw new Error(error.message || "Failed to fetch reviews");
  }

  return response.json();
}

/**
 * Update an existing review
 * @param token - Authentication token
 * @param id - Review ID
 * @param data - Updated review data
 * @returns Promise with the updated review
 */
export async function updateReview(
  token: string,
  id: string,
  data: UpdateReviewData
): Promise<SingleReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to update review",
    }));
    throw new Error(error.message || "Failed to update review");
  }

  return response.json();
}

/**
 * Delete a review
 * @param token - Authentication token
 * @param id - Review ID
 * @returns Promise with success message
 */
export async function deleteReview(
  token: string,
  id: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to delete review",
    }));
    throw new Error(error.message || "Failed to delete review");
  }

  return response.json();
}
