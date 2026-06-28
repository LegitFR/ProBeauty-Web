/**
 * Address API Client Functions
 * Handles address management for authenticated users
 */

import { fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

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
export async function getAddresses(_token: string): Promise<Address[]> {
  void _token;
  try {
    const data = await fetchJsonWithAuth<AddressResponse>(API_BASE_URL, {
      method: "GET",
      cache: "no-store",
    });
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
  _token: string,
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
  void _token;
  try {
    const data = await fetchJsonWithAuth<SingleAddressResponse>(API_BASE_URL, {
      method: "POST",
      body: JSON.stringify(addressData),
    });
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
  _token: string,
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
  void _token;
  try {
    const data = await fetchJsonWithAuth<SingleAddressResponse>(
      `${API_BASE_URL}/${addressId}`,
      {
        method: "PATCH",
        body: JSON.stringify(addressData),
      },
    );
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
  _token: string,
  addressId: string
): Promise<void> {
  void _token;

  try {
    await fetchJsonWithAuth<{ message: string }>(`${API_BASE_URL}/${addressId}`, {
      method: "DELETE",
    });

  } catch (error) {
    console.error("[Address API] Delete address error:", error);
    throw error;
  }
}

/**
 * Set address as default
 */
export async function setDefaultAddress(
  _token: string,
  addressId: string
): Promise<Address> {
  void _token;
  try {
    const data = await fetchJsonWithAuth<SingleAddressResponse>(
      `${API_BASE_URL}/${addressId}/set-default`,
      {
        method: "PATCH",
      },
    );
    return data.data;
  } catch (error) {
    console.error("[Address API] Set default address error:", error);
    throw error;
  }
}
