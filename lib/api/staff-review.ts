/**
 * Staff Review API Client Functions
 * Handles staff member reviews and ratings
 */

import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/staff-reviews";

export interface StaffReview {
  id: string;
  userId: string;
  staffId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  staff?: {
    id: string;
    name: string;
    image?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    salon?: {
      id: string;
      name: string;
      address: string;
    };
  };
  booking?: {
    id: string;
    startTime: string;
    endTime: string;
    service?: {
      id: string;
      title: string;
    };
  };
}

export interface StaffReviewsResponse {
  message: string;
  data: StaffReview[];
  averageRating?: number;
  totalRatings?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleStaffReviewResponse {
  message: string;
  data: StaffReview;
}

/**
 * Create a new staff review
 */
export async function createStaffReview(
  token: string,
  data: {
    staffId: string;
    bookingId: string;
    rating: number;
    comment?: string;
  },
): Promise<SingleStaffReviewResponse> {
  return fetchJsonWithAuth(`${API_BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Get staff review by ID
 */
export async function getStaffReview(
  reviewId: string,
): Promise<SingleStaffReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/${reviewId}`);
  return response.json();
}

/**
 * Get reviews for a specific staff member
 */
export async function getStaffReviews(
  staffId: string,
  page: number = 1,
  limit: number = 10,
): Promise<StaffReviewsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/staff/${staffId}?page=${page}&limit=${limit}`,
  );
  return response.json();
}

/**
 * Get current user's staff reviews
 */
export async function getMyStaffReviews(
  token: string,
  page: number = 1,
  limit: number = 10,
): Promise<StaffReviewsResponse> {
  return fetchJsonWithAuth(
    `${API_BASE_URL}/user/me?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Update a staff review
 */
export async function updateStaffReview(
  token: string,
  reviewId: string,
  data: {
    rating?: number;
    comment?: string;
  },
): Promise<SingleStaffReviewResponse> {
  return fetchJsonWithAuth(`${API_BASE_URL}/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a staff review
 */
export async function deleteStaffReview(
  token: string,
  reviewId: string,
): Promise<{ message: string }> {
  return fetchJsonWithAuth(`${API_BASE_URL}/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
