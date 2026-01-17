/**
 * Booking API Client Functions
 * Handles appointment bookings
 */

import { isAuthExpired, handleAuthError } from "@/lib/utils/authErrorHandler";

const API_BASE_URL = "/api/bookings";

export type BookingStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  salon?: {
    id: string;
    name: string;
    address: string;
  };
  service?: {
    id: string;
    title: string;
    durationMinutes: number;
    price: string;
  };
  staff?: {
    id: string;
    role: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  message: string;
  data: {
    date: string;
    salon: {
      id: string;
      name: string;
    };
    service: {
      id: string;
      title: string;
      durationMinutes: number;
    };
    staff: {
      id: string;
      role: string;
    };
    slots: TimeSlot[];
  };
}

export interface BookingsResponse {
  message: string;
  data: Booking[];
}

export interface SingleBookingResponse {
  message: string;
  data: Booking;
}

/**
 * Create a new booking
 */
export async function createBooking(
  token: string,
  data: {
    salonId: string;
    serviceId: string;
    staffId?: string;
    startTime: string;
  },
): Promise<SingleBookingResponse> {
  console.log("Creating booking with data:", data);

  const response = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  console.log("Booking response status:", response.status);

  if (!response.ok) {
    const responseText = await response.text();
    console.error("Booking error response:", responseText);

    let error;
    try {
      error = JSON.parse(responseText);
    } catch (e) {
      throw new Error(
        `Failed to create booking: ${response.status} - ${responseText}`,
      );
    }

    throw new Error(error.message || error.error || "Failed to create booking");
  }
  return await response.json();
}

/**
 * Get available time slots
 */
export async function getAvailableSlots(params: {
  salonId: string;
  serviceId: string;
  staffId?: string;
  date: string;
}): Promise<AvailabilityResponse> {
  // Filter out undefined values from params
  const filteredParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      filteredParams[key] = value;
    }
  });

  const queryParams = new URLSearchParams(filteredParams);
  const response = await fetch(`${API_BASE_URL}/availability?${queryParams}`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to fetch available slots" }));

    // Try to extract the actual backend error message
    let errorMessage =
      errorData.message ||
      `Failed to fetch available slots: ${response.status}`;

    // If the error message contains JSON with the backend error, parse it
    if (
      typeof errorMessage === "string" &&
      errorMessage.includes("Backend returned")
    ) {
      try {
        const match = errorMessage.match(/\{[^}]+\}/);
        if (match) {
          const backendError = JSON.parse(match[0]);
          errorMessage = backendError.message || errorMessage;
        }
      } catch (e) {
        // If parsing fails, use the original message
      }
    }

    throw new Error(errorMessage);
  }
  return await response.json();
}

/**
 * Get all bookings (role-based filtering applied on backend)
 */
export async function getBookings(
  token: string,
  filters?: {
    salonId?: string;
    staffId?: string;
    status?: BookingStatus;
    startDate?: string;
    endDate?: string;
  },
): Promise<BookingsResponse> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
  }
  const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Check for token expiration
    if (response.status === 401 && isAuthExpired(errorData)) {
      handleAuthError(errorData);
    }

    throw new Error(errorData.message || "Failed to fetch bookings");
  }
  return await response.json();
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Check for token expiration
    if (response.status === 401 && isAuthExpired(errorData)) {
      handleAuthError(errorData);
    }

    throw new Error(errorData.message || "Failed to fetch booking");
  }
  return await response.json();
}

/**
 * Update a booking
 */
export async function updateBooking(
  token: string,
  id: string,
  data: Partial<{
    startTime: string;
    staffId: string;
    status: BookingStatus;
  }>,
): Promise<SingleBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    // Check for token expiration
    if (response.status === 401 && isAuthExpired(error)) {
      handleAuthError(error);
    }

    throw new Error(error.message || "Failed to update booking");
  }
  return await response.json();
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Check for token expiration
    if (response.status === 401 && isAuthExpired(errorData)) {
      handleAuthError(errorData);
    }

    throw new Error(errorData.message || "Failed to cancel booking");
  }
  return await response.json();
}

/**
 * Confirm a booking (salon owner/admin only)
 */
export async function confirmBooking(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Check for token expiration
    if (response.status === 401 && isAuthExpired(errorData)) {
      handleAuthError(errorData);
    }

    throw new Error(errorData.message || "Failed to confirm booking");
  }
  return await response.json();
}

/**
 * Complete a booking (salon owner/admin only)
 */
export async function completeBooking(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to complete booking");
  }
  return await response.json();
}
