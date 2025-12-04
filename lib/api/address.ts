/**
 * Address API Client Functions
 * Handles address management for authenticated users
 */

const API_BASE_URL = "/api/address";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressResponse {
  message: string;
  data: Address[];
}

export interface SingleAddressResponse {
  message: string;
  data: Address;
}

/**
 * Get all addresses for authenticated user
 */
export async function getAddresses(token: string): Promise<Address[]> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch addresses");
    }

    const data: AddressResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("[Address API] Get addresses error:", error);
    throw error;
  }
}

/**
 * Create a new address
 */
export async function createAddress(
  token: string,
  addressData: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }
): Promise<Address> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create address");
    }

    const data: SingleAddressResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("[Address API] Create address error:", error);
    throw error;
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(
  token: string,
  addressId: string,
  addressData: Partial<{
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>
): Promise<Address> {
  try {
    const response = await fetch(`${API_BASE_URL}/${addressId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error("Failed to update address");
    }

    const data: SingleAddressResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("[Address API] Update address error:", error);
    throw error;
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(
  token: string,
  addressId: string
): Promise<void> {
  console.log("[Address API] Deleting address:", addressId);
  console.log("[Address API] Delete URL:", `${API_BASE_URL}/${addressId}`);

  try {
    const response = await fetch(`${API_BASE_URL}/${addressId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[Address API] Delete response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Address API] Delete failed:", errorData);
      console.error("[Address API] Validation errors:", errorData.errors);

      const errorMessage =
        errorData.message || `Failed to delete address (${response.status})`;
      throw new Error(errorMessage);
    }

    console.log("[Address API] Address deleted successfully");
  } catch (error) {
    console.error("[Address API] Delete address error:", error);
    throw error;
  }
}

/**
 * Set address as default
 */
export async function setDefaultAddress(
  token: string,
  addressId: string
): Promise<Address> {
  try {
    const response = await fetch(`${API_BASE_URL}/${addressId}/set-default`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to set default address");
    }

    const data: SingleAddressResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("[Address API] Set default address error:", error);
    throw error;
  }
}
