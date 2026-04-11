/**
 * Booking API Client Functions
 * Handles appointment bookings
 */

import { fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/bookings";

export type BookingStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface ServiceAssignment {
  serviceId: string;
  staffId: string;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  serviceId?: string; // deprecated - keeping for backward compatibility
  staffId?: string; // deprecated - keeping for backward compatibility
  serviceIds: string[];
  staffIds: string[];
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
    // deprecated - keeping for backward compatibility
    id: string;
    title: string;
    durationMinutes: number;
    price: string;
  };
  services?: Array<{
    id: string;
    title: string;
    durationMinutes: number;
    price: string;
  }>;
  staff?: {
    id: string;
    role: string;
    user?: {
      name: string;
      email: string;
    };
  };
  staffMembers?: Array<{
    id: string;
    name?: string;
    role?: string;
    user?: {
      name: string;
      email: string;
    };
  }>;
  serviceAssignments?: ServiceAssignment[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailableStaffAtTimeResponse {
  message: string;
  data: Array<{
    id: string;
    name?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface AvailabilityResponse {
  message: string;
  data: {
    date: string;
    salon: {
      id: string;
      name: string;
    };
    service?: {
      // deprecated - keeping for backward compatibility
      id: string;
      title: string;
      durationMinutes: number;
    };
    services?: Array<{
      id: string;
      title: string;
      durationMinutes: number;
    }>;
    staff?: {
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
 * Note: Backend expects 'serviceId' and 'staffId' (singular) even for multiple services/staff
 *       Multiple values should be comma-separated strings
 */
export async function createBooking(
  token: string,
  data: {
    salonId: string;
    serviceId?: string; // deprecated - for backward compatibility
    serviceIds?: string[]; // new field for multiple services (will be converted to comma-separated)
    staffId?: string; // deprecated - for backward compatibility
    staffIds?: string[]; // new field for multiple staff (will be converted to comma-separated)
    startTime: string;
  },
): Promise<SingleBookingResponse> {
  console.log("=== Creating Booking ===");
  console.log("Input data:", data);

  // Build request body - backend expects arrays for serviceIds and staffIds
  const requestData: {
    salonId: string;
    startTime: string;
    serviceIds?: string[];
    staffIds?: string[];
  } = {
    salonId: data.salonId,
    startTime: data.startTime,
  };

  // Backend expects 'serviceIds' as an array
  if (data.serviceIds && data.serviceIds.length > 0) {
    requestData.serviceIds = data.serviceIds;
  } else if (data.serviceId) {
    requestData.serviceIds = [data.serviceId];
  }

  // Backend expects 'staffIds' as an array
  if (data.staffIds && data.staffIds.length > 0) {
    requestData.staffIds = data.staffIds;
  } else if (data.staffId) {
    requestData.staffIds = [data.staffId];
  }

  console.log(
    "🔍 Request body being sent:",
    JSON.stringify(requestData, null, 2),
  );
  console.log("Sending to:", `${API_BASE_URL} (POST)`);

  try {
    const response = await fetchJsonWithAuth<SingleBookingResponse>(
      `${API_BASE_URL}`,
      {
        method: "POST",
        body: JSON.stringify(requestData),
      },
    );
    console.log("✅ Booking created successfully");
    return response;
  } catch (error: unknown) {
    console.error("❌ Booking creation failed");
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
}

/**
 * Get available time slots
 * Note: Backend expects 'serviceIds' (plural) as query param (comma-separated string or JSON array)
 */
export async function getAvailableSlots(params: {
  salonId: string;
  serviceId?: string; // deprecated - for backward compatibility
  serviceIds?: string | string[]; // new field for multiple services (supports comma-separated string or array)
  staffId?: string;
  date: string;
}): Promise<AvailabilityResponse> {
  // Build query parameters
  const filteredParams: Record<string, string> = {};

  // Add salonId
  if (params.salonId) {
    filteredParams.salonId = params.salonId;
  }

  // Add serviceIds (support both array and single service for backward compatibility)
  // Backend expects 'serviceIds' as the query parameter name
  if (params.serviceIds) {
    if (Array.isArray(params.serviceIds)) {
      filteredParams.serviceIds = params.serviceIds.join(",");
    } else {
      filteredParams.serviceIds = params.serviceIds;
    }
  } else if (params.serviceId) {
    filteredParams.serviceIds = params.serviceId;
  }

  // Add staffId if provided
  if (params.staffId) {
    filteredParams.staffId = params.staffId;
  }

  // Add date
  if (params.date) {
    filteredParams.date = params.date;
  }

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
      } catch {
        // If parsing fails, use the original message
      }
    }

    throw new Error(errorMessage);
  }
  return await response.json();
}

/**
 * Validate which staff are available at an exact start time for a service
 * Uses user-facing salon endpoint: /salons/:salonId/services/:serviceId/available-staff
 */
export async function getAvailableStaffAtTime(params: {
  salonId: string;
  serviceId: string;
  startTime: string;
}): Promise<AvailableStaffAtTimeResponse> {
  const response = await fetch(
    `/api/salons/${params.salonId}/services/${params.serviceId}/available-staff?startTime=${encodeURIComponent(params.startTime)}`,
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to validate staff availability" }));
    throw new Error(error.message || "Failed to validate staff availability");
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
  return await fetchJsonWithAuth<BookingsResponse>(
    `${API_BASE_URL}?${queryParams}`,
    {
      method: "GET",
    },
  );
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  return await fetchJsonWithAuth<SingleBookingResponse>(
    `${API_BASE_URL}/${id}`,
    {
      method: "GET",
    },
  );
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
  return await fetchJsonWithAuth<SingleBookingResponse>(
    `${API_BASE_URL}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  return await fetchJsonWithAuth<SingleBookingResponse>(
    `${API_BASE_URL}/${id}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Confirm a booking (salon owner/admin only)
 */
export async function confirmBooking(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  return await fetchJsonWithAuth<SingleBookingResponse>(
    `${API_BASE_URL}/${id}/confirm`,
    {
      method: "POST",
    },
  );
}

/**
 * Complete a booking (salon owner/admin only)
 */
export async function completeBooking(
  token: string,
  id: string,
): Promise<SingleBookingResponse> {
  return await fetchJsonWithAuth<SingleBookingResponse>(
    `${API_BASE_URL}/${id}/complete`,
    {
      method: "POST",
    },
  );
}
