/**
 * Custom hook to manage offers
 * Provides state management and helpers for working with offers
 */

import { useState, useEffect, useCallback } from "react";
import {
  getActiveOffers,
  getOfferById,
  validateOffer,
  isOfferValid,
  calculateDiscount,
} from "@/lib/api/offer";
import type {
  Offer,
  GetOffersParams,
  ValidateOfferRequest,
} from "@/lib/types/offer";

interface UseOffersReturn {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage active offers
 */
export function useOffers(params?: GetOffersParams): UseOffersReturn {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveOffers(params);
      setOffers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch offers");
      setOffers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [
    params?.salonId,
    params?.productId,
    params?.serviceId,
    params?.page,
    params?.limit,
  ]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    pagination,
    refetch: fetchOffers,
  };
}

interface UseOfferReturn {
  offer: Offer | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single offer by ID
 */
export function useOffer(offerId: string | null): UseOfferReturn {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffer = useCallback(async () => {
    if (!offerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getOfferById(offerId);
      setOffer(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch offer");
      setOffer(null);
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    fetchOffer();
  }, [fetchOffer]);

  return {
    offer,
    loading,
    error,
    refetch: fetchOffer,
  };
}

interface UseOfferValidationReturn {
  validating: boolean;
  validationResult: {
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
  } | null;
  error: string | null;
  validate: (request: ValidateOfferRequest) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to validate offers and calculate discounts
 */
export function useOfferValidation(): UseOfferValidationReturn {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async (request: ValidateOfferRequest) => {
    try {
      setValidating(true);
      setError(null);
      const response = await validateOffer(request);

      // Handle response safely - API might return error without data structure
      if (response.data) {
        setValidationResult(response.data);

        if (!response.data.valid && response.error) {
          setError(response.error);
        }
      } else if (response.error || response.message) {
        // API returned error without data
        setError(
          response.error || response.message || "Offer validation failed",
        );
        setValidationResult({
          valid: false,
          discountAmount: 0,
          finalAmount: request.amount ? parseFloat(request.amount) : 0,
        });
      } else {
        setError("Invalid response from server");
        setValidationResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate offer");
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setValidationResult(null);
    setError(null);
  }, []);

  return {
    validating,
    validationResult,
    error,
    validate,
    reset,
  };
}

/**
 * Helper hook to check if an offer is currently valid
 */
export function useIsOfferValid(offer: Offer | null): boolean {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!offer) {
      setIsValid(false);
      return;
    }

    setIsValid(isOfferValid(offer));

    // Set up interval to check validity every minute
    const interval = setInterval(() => {
      setIsValid(isOfferValid(offer));
    }, 60000);

    return () => clearInterval(interval);
  }, [offer]);

  return isValid;
}

/**
 * Helper hook to calculate discount for display purposes
 */
export function useOfferDiscount(
  offer: Offer | null,
  amount: number,
): { discountAmount: number; finalAmount: number } | null {
  if (!offer || !isOfferValid(offer)) return null;

  return calculateDiscount(amount, offer.discountType, offer.discountValue);
}
