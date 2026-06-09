/**
 * Review Type Definitions
 */

export interface Review {
  id: string;
  userId: string;
  salonId: string;
  serviceId?: string | null;
  productId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
  salon?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    title: string;
  } | null;
  product?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateReviewData {
  salonId: string;
  serviceId?: string;
  productId?: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ReviewsResponse {
  message: string;
  data: Review[];
  averageRating?: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleReviewResponse {
  message: string;
  data: Review;
}
