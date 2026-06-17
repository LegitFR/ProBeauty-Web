/**
 * Favourite/Wishlist Type Definitions
 */

export interface ProductFavourite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    salonId: string;
    title: string;
    sku: string;
    price: string;
    quantity: number;
    images: string[];
    salon: {
      id: string;
      name: string;
    };
  };
}

export interface SalonFavourite {
  id: string;
  userId: string;
  salonId: string;
  createdAt: string;
  salon: {
    id: string;
    name: string;
    address: string;
    thumbnail: string;
    images: string[];
    venueType: string;
    verified: boolean;
    geo: { latitude: number; longitude: number };
    hours: any;
  };
}

export type Favourite = ProductFavourite | SalonFavourite;

export interface AddToFavouritesData {
  type: "product" | "salon";
  itemId: string;
}

export interface FavouritesResponse {
  message: string;
  data: Favourite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleFavouriteResponse {
  message: string;
  data: Favourite;
}

export interface FavouriteStatusResponse {
  message: string;
  data: {
    id: string;
    type: "product" | "salon";
    isFavourited: boolean;
  };
}

export interface RemoveFavouriteResponse {
  message: string;
}
