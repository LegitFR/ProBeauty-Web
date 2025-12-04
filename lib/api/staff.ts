/**
 * Staff API Client Functions
 * Handles salon staff members
 */

const API_BASE_URL = "/api/staff";

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
  salonId: string;
  role: string;
  availability: StaffAvailability;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
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
 */
export async function getStaffBySalon(salonId: string): Promise<StaffResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/salon/${salonId}`);

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
          `Failed to fetch staff members: ${response.status} - Backend returned invalid response`
        );
      }
      throw new Error(
        errorData.message || `Failed to fetch staff members: ${response.status}`
      );
    }

    // Try to parse successful response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse staff response:", responseText);
      // Return empty staff list if backend returns invalid JSON
      console.warn(
        "Returning empty staff list due to invalid backend response"
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
