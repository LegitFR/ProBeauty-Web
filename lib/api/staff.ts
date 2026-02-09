/**
 * Staff API Client Functions
 * Handles salon staff members and staff reviews
 */

import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/staff";
const REVIEWS_BASE_URL = "/api/staff-reviews";

export interface StaffAvailability {
  monday?: {
    isAvailable: boolean;
    slots?: Array<{ start: string; end: string }>;
  };
  tuesday?: {
    isAvailable: boolean;
    slots?: Array<{ start: string; end: string }>;
  };
  wednesday?: {
    isAvailable: boolean;
    slots?: Array<{ start: string; end: string }>;
  };
  thursday?: {
    isAvailable: boolean;
    slots?: Array<{ start: string; end: string }>;
  };
  friday?: {
    isAvailable: boolean;
    slots?: Array<{ start: string; end: string }>;
  };
  saturday?: {
    isAvailable: boolean;
    slots?: Array<{ start: string; end: string }>;
  };
  sunday?: {
    isAvailable: boolean;
    slots?: Array<{ start: string; end: string }>;
  };
}

export interface Staff {
  id: string;
  name?: string; // Name is directly on staff object
  image?: string | null; // Staff profile image URL from Cloudinary
  salonId: string;
  role?: string; // Role might not exist in the data
  availability: StaffAvailability;
  services?: Array<{
    id: string;
    title?: string;
  }>; // Services this staff member can perform
  serviceIds?: string[]; // Alternative: just service IDs
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string | null; // User profile picture as fallback
    image?: string | null; // Alternative image field
  };
  salon?: {
    id: string;
    name: string;
    address?: string;
  };
  // Rating fields (populated from staff reviews)
  averageRating?: number;
  totalRatings?: number;
}

export interface StaffResponse {
  message: string;
  data: Staff[];
}

export interface SingleStaffResponse {
  message: string;
  data: Staff;
}

/**
 * Get all staff members for a salon
 * @param serviceId Optional service ID to filter staff who can perform this service
 */
export async function getStaffBySalon(
  salonId: string,
  serviceId?: string,
): Promise<StaffResponse> {
  try {
    // Build URL with optional serviceId parameter
    const url = serviceId
      ? `${API_BASE_URL}/salon/${salonId}?serviceId=${serviceId}`
      : `${API_BASE_URL}/salon/${salonId}`;
    const response = await fetch(url);

    // Try to get the response text first
    const responseText = await response.text();

    if (!response.ok) {
      // Try to parse as JSON, but handle invalid JSON
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse error response:", responseText);
        throw new Error(
          `Failed to fetch staff members: ${response.status} - Backend returned invalid response`,
        );
      }
      throw new Error(
        errorData.message ||
          `Failed to fetch staff members: ${response.status}`,
      );
    }

    // Try to parse successful response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse staff response:", responseText);
      // Return empty staff list if backend returns invalid JSON
      console.warn(
        "Returning empty staff list due to invalid backend response",
      );
      return { message: "Staff data unavailable", data: [] };
    }
  } catch (error: any) {
    console.error("Error in getStaffBySalon:", error);
    // If it's a network error or our thrown error, re-throw it
    if (error.message) {
      throw error;
    }
    // Otherwise throw a generic error
    throw new Error("Failed to fetch staff members");
  }
}

/**
 * Get a single staff member by ID
 */
export async function getStaffById(id: string): Promise<SingleStaffResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch staff member");
  }
  return await response.json();
}

// ===== NEW ENDPOINTS =====

/**
 * Get available staff for a specific date
 */
export interface AvailableStaffResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    dayOfWeek: string;
    staff: Array<{
      id: string;
      name: string;
      image?: string | null;
      user?: {
        id: string;
        name: string;
        email: string;
      };
      services: Array<{
        id: string;
        title: string;
        price: number;
        durationMinutes: number;
      }>;
      availability: {
        isAvailable: boolean;
        slots: Array<{ start: string; end: string }>;
      };
    }>;
  };
}

export async function getAvailableStaffByDate(
  salonId: string,
  date: string,
  serviceId?: string,
): Promise<AvailableStaffResponse> {
  const params = new URLSearchParams({ salonId, date });
  if (serviceId) params.append("serviceId", serviceId);

  const response = await fetch(`${API_BASE_URL}/available-on-date?${params}`);
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch available staff" }));
    throw new Error(error.message || "Failed to fetch available staff");
  }
  return await response.json();
}

/**
 * Get staff availability for a specific date
 */
export interface StaffAvailabilityForDateResponse {
  success: boolean;
  message: string;
  data: {
    staff: {
      id: string;
      name: string;
      image?: string | null;
      user?: {
        id: string;
        name: string;
        email: string;
      };
      services: Array<{
        id: string;
        title: string;
        price: number;
        durationMinutes: number;
      }>;
    };
    date: string;
    dayOfWeek: string;
    availability: {
      isAvailable: boolean;
      slots: Array<{ start: string; end: string }>;
    };
    bookings: Array<{
      id: string;
      start: string;
      end: string;
      status: string;
    }>;
  };
}

export async function getStaffAvailabilityForDate(
  staffId: string,
  date: string,
): Promise<StaffAvailabilityForDateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/${staffId}/availability-for-date?date=${date}`,
  );
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch staff availability" }));
    throw new Error(error.message || "Failed to fetch staff availability");
  }
  return await response.json();
}

// ===== STAFF REVIEWS =====

export interface StaffReview {
  id: string;
  staffId: string;
  userId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
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

export interface CreateStaffReviewData {
  staffId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

/**
 * Create a staff review
 */
export async function createStaffReview(
  token: string,
  data: CreateStaffReviewData,
): Promise<SingleStaffReviewResponse> {
  return await fetchJsonWithAuth<SingleStaffReviewResponse>(REVIEWS_BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get staff review by ID
 */
export async function getStaffReviewById(
  reviewId: string,
): Promise<SingleStaffReviewResponse> {
  const response = await fetch(`${REVIEWS_BASE_URL}/${reviewId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch staff review");
  }
  return await response.json();
}

/**
 * Get reviews for a specific staff member
 */
export async function getStaffReviews(
  staffId: string,
  page = 1,
  limit = 10,
): Promise<StaffReviewsResponse> {
  const response = await fetch(
    `${REVIEWS_BASE_URL}/staff/${staffId}?page=${page}&limit=${limit}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch staff reviews");
  }
  return await response.json();
}

/**
 * Get current user's staff reviews
 */
export async function getMyStaffReviews(
  token: string,
  page = 1,
  limit = 10,
): Promise<StaffReviewsResponse> {
  return await fetchJsonWithAuth<StaffReviewsResponse>(
    `${REVIEWS_BASE_URL}/user/me?page=${page}&limit=${limit}`,
    { method: "GET" },
  );
}

/**
 * Update a staff review
 */
export async function updateStaffReview(
  token: string,
  reviewId: string,
  data: { rating?: number; comment?: string },
): Promise<SingleStaffReviewResponse> {
  return await fetchJsonWithAuth<SingleStaffReviewResponse>(
    `${REVIEWS_BASE_URL}/${reviewId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Delete a staff review
 */
export async function deleteStaffReview(
  token: string,
  reviewId: string,
): Promise<{ message: string }> {
  return await fetchJsonWithAuth<{ message: string }>(
    `${REVIEWS_BASE_URL}/${reviewId}`,
    { method: "DELETE" },
  );
}
