/**
 * Offer Type Definitions
 */

export interface Offer {
  id: string;
  salonId: string;
  title: string;
  description: string;
  offerType: "salon" | "product" | "service";
  productId?: string | null;
  serviceId?: string | null;
  discountType: "percentage" | "flat";
  discountValue: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  salon?: {
    id: string;
    name: string;
    address?: string;
  };
  product?: {
    id: string;
    title: string;
    price?: string;
  } | null;
  service?: {
    id: string;
    title: string;
    price?: string;
  } | null;
}

export interface ValidateOfferRequest {
  offerId: string;
  amount: string;
  salonId: string;
  productId?: string;
  serviceId?: string;
}

export interface ValidateOfferResponse {
  message: string;
  data: {
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
  };
  error?: string;
}

export interface OffersResponse {
  message: string;
  data: Offer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleOfferResponse {
  message: string;
  data: Offer;
}

export interface GetOffersParams {
  salonId?: string;
  productId?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
}
