/**
 * Service API Client Functions
 * Handles salon services
 */

const API_BASE_URL = "/api/services";

export interface Service {
  id: string;
  salonId: string;
  title: string;
  durationMinutes: number;
  price: string;
  salon?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface ServicesResponse {
  message: string;
  data: Service[];
}

export interface SingleServiceResponse {
  message: string;
  data: Service;
}

/**
 * Get all services across all salons
 */
export async function getServices(): Promise<ServicesResponse> {
  const response = await fetch(`${API_BASE_URL}`);
  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }
  return await response.json();
}

/**
 * Get a single service by ID
 */
export async function getServiceById(
  id: string
): Promise<SingleServiceResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch service");
  }
  return await response.json();
}

/**
 * Get services by salon ID
 */
export async function getServicesBySalon(
  salonId: string
): Promise<ServicesResponse> {
  const response = await fetch(`${API_BASE_URL}/salon/${salonId}`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to fetch salon services" }));
    throw new Error(
      errorData.message || `Failed to fetch salon services: ${response.status}`
    );
  }
  return await response.json();
}

/**
 * Create a new service (salon owner only)
 */
export async function createService(
  token: string,
  data: {
    salonId: string;
    title: string;
    durationMinutes: number;
    price: number;
  }
): Promise<SingleServiceResponse> {
  const response = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create service");
  }
  return await response.json();
}

/**
 * Update a service (salon owner only)
 */
export async function updateService(
  token: string,
  id: string,
  data: Partial<{
    title: string;
    durationMinutes: number;
    price: number;
  }>
): Promise<SingleServiceResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update service");
  }
  return await response.json();
}

/**
 * Delete a service (salon owner only)
 */
export async function deleteService(
  token: string,
  id: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete service");
  }
  return await response.json();
}
