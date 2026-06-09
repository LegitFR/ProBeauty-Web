/**
 * Favourite/Wishlist Type Definitions
 */

export interface Favourite {
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

export interface AddToFavouritesData {
  productId: string;
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
    productId: string;
    isFavourited: boolean;
  };
}

export interface RemoveFavouriteResponse {
  message: string;
}
