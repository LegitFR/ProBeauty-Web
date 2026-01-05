/**
 * Salon API Client Functions
 * Handles salon listing and management
 */

const API_BASE_URL = "/api/salons";

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

export interface SalonStaff {
  id: string;
  salonId: string;
  role: string;
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
  };
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  phone?: string;
  ownerId: string;
  verified: boolean;
  thumbnail?: string | null;
  images?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
  hours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  staff?: SalonStaff[];
  services?: any[];
  products?: any[];
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SalonsResponse {
  message: string;
  data: Salon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleSalonResponse {
  message: string;
  data: Salon;
}

/**
 * Get all salons with optional filtering
 */
export async function getSalons(params?: {
  page?: number;
  limit?: number;
  verified?: boolean;
}): Promise<SalonsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.verified !== undefined)
      queryParams.append("verified", params.verified.toString());

    const url = `${API_BASE_URL}${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch salons");
    }

    return await response.json();
  } catch (error) {
    console.error("[Salon API] Error fetching salons:", error);
    throw error;
  }
}

/**
 * Get salon by ID
 */
export async function getSalonById(id: string): Promise<SingleSalonResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch salon");
    }

    return await response.json();
  } catch (error) {
    console.error("[Salon API] Error fetching salon:", error);
    throw error;
  }
}

/**
 * Get user's salons (protected)
 */
export async function getMySalons(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    verified?: boolean;
  }
): Promise<SalonsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.verified !== undefined)
      queryParams.append("verified", params.verified.toString());

    const url = `${API_BASE_URL}/my-salons${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch your salons");
    }

    return await response.json();
  } catch (error) {
    console.error("[Salon API] Error fetching my salons:", error);
    throw error;
  }
}
