/**
 * API functions for fetching offers
 * User-facing endpoints only (public offers)
 */

import {
  Offer,
  OffersResponse,
  SingleOfferResponse,
  GetOffersParams,
  ValidateOfferRequest,
  ValidateOfferResponse,
} from "@/lib/types/offer";

const API_BASE_URL = "https://probeauty-backend.onrender.com/api/v1";

/**
 * Get all active offers with optional filters
 * @param params - Query parameters for filtering offers
 * @returns Promise with offers response
 */
export async function getActiveOffers(
  params?: GetOffersParams,
): Promise<OffersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.salonId) queryParams.append("salonId", params.salonId);
  if (params?.productId) queryParams.append("productId", params.productId);
  if (params?.serviceId) queryParams.append("serviceId", params.serviceId);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const url = `${API_BASE_URL}/offers/public/active${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch active offers");
  }

  return response.json();
}

/**
 * Get a specific offer by ID (public view)
 * @param offerId - The offer ID
 * @returns Promise with single offer response
 */
export async function getOfferById(
  offerId: string,
): Promise<SingleOfferResponse> {
  const response = await fetch(`${API_BASE_URL}/offers/public/${offerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch offer");
  }

  return response.json();
}

/**
 * Validate an offer and calculate discount amount
 * @param request - Validation request with offer ID, amount, and context
 * @returns Promise with validation response including discount calculation
 */
export async function validateOffer(
  request: ValidateOfferRequest,
): Promise<ValidateOfferResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/offers/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(
        "API returned non-JSON response:",
        response.status,
        response.statusText,
      );
      return {
        message: "Invalid response from server",
        data: {
          valid: false,
          discountAmount: 0,
          finalAmount: parseFloat(request.amount),
        },
        error: "Server error - please try again later",
      };
    }

    const data = await response.json();

    // Return data even if response is not ok (validation can fail gracefully)
    return data;
  } catch (error) {
    console.error("Error validating offer:", error);
    return {
      message: "Validation failed",
      data: {
        valid: false,
        discountAmount: 0,
        finalAmount: parseFloat(request.amount),
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get offers for a specific salon
 * @param salonId - The salon ID
 * @param page - Page number (optional)
 * @param limit - Items per page (optional)
 * @returns Promise with offers response
 */
export async function getOffersBySalon(
  salonId: string,
  page?: number,
  limit?: number,
): Promise<OffersResponse> {
  return getActiveOffers({ salonId, page, limit });
}

/**
 * Get offers for a specific product
 * @param productId - The product ID
 * @param salonId - The salon ID (optional but recommended)
 * @returns Promise with offers response
 */
export async function getOffersForProduct(
  productId: string,
  salonId?: string,
): Promise<OffersResponse> {
  return getActiveOffers({ productId, salonId });
}

/**
 * Get offers for a specific service
 * @param serviceId - The service ID
 * @param salonId - The salon ID (optional but recommended)
 * @returns Promise with offers response
 */
export async function getOffersForService(
  serviceId: string,
  salonId?: string,
): Promise<OffersResponse> {
  return getActiveOffers({ serviceId, salonId });
}

/**
 * Calculate discount amount based on offer details
 * Helper function for client-side calculations
 */
export function calculateDiscount(
  amount: number,
  discountType: "percentage" | "flat",
  discountValue: string,
): { discountAmount: number; finalAmount: number } {
  const discount = parseFloat(discountValue);

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = amount * (discount / 100);
  } else if (discountType === "flat") {
    discountAmount = Math.min(discount, amount); // Don't exceed total amount
  }

  const finalAmount = Math.max(0, amount - discountAmount);

  return {
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    finalAmount: parseFloat(finalAmount.toFixed(2)),
  };
}

/**
 * Check if an offer is currently valid
 * Helper function for client-side validation
 */
export function isOfferValid(offer: Offer): boolean {
  if (!offer.isActive) return false;

  const now = new Date();
  const startsAt = new Date(offer.startsAt);
  const endsAt = new Date(offer.endsAt);

  return now >= startsAt && now <= endsAt;
}
