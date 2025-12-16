/**
 * API functions for fetching products
 * Server-side functions call backend directly
 * Client-side functions use Next.js API proxy route
 */

const API_BASE_URL = "https://probeauty-backend.onrender.com/api/v1";
const CLIENT_API_BASE_URL = "/api/products";

interface ApiProduct {
  id: string;
  salonId: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  message: string;
  data: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DisplayProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  originalPrice: number;
  finalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  isSpecialOffer: boolean;
  badge: string;
  description: string;
  inStock: boolean;
}

/**
 * Fetches all products from the backend API (Server-side only)
 * @param limit - Number of products to fetch (default: 50)
 * @returns Array of products or empty array on error
 */
export async function fetchProducts(limit: number = 50): Promise<ApiProduct[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products?limit=${limit}&inStock=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Always fetch fresh data
        // Alternative for ISR: next: { revalidate: 300 } // Revalidate every 5 minutes
      }
    );

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: ProductsResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Fetches products via Next.js API proxy (Client-side safe)
 * @param limit - Number of products to fetch (default: 50)
 * @returns Array of products or empty array on error
 */
export async function fetchProductsClient(
  limit: number = 50
): Promise<ApiProduct[]> {
  try {
    const response = await fetch(
      `${CLIENT_API_BASE_URL}?limit=${limit}&inStock=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: ProductsResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Simple hash function to generate consistent values from product ID
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Transforms API products to display format with fallback values
 * @param apiProducts - Products from the API
 * @returns Array of display-ready products
 */
export function transformProducts(apiProducts: ApiProduct[]): DisplayProduct[] {
  return apiProducts.map((product) => {
    // Use first image from API
    const image =
      product.images && product.images.length > 0 ? product.images[0] : "";

    // Generate consistent values based on product ID hash
    const hash = hashCode(product.id);

    // No discount for now - salon owners haven't decided on offers
    const discount = 0;
    const originalPrice = product.price;
    const finalPrice = product.price; // Show actual price from API

    // Generate consistent rating and reviews based on product ID
    const rating = 4.5 + (hash % 5) / 10; // Consistent rating 4.5-5.0
    const reviews = 50 + (hash % 200); // Consistent reviews 50-250

    return {
      id: product.id,
      name: product.title,
      brand: "ProBeauty", // Default brand - can be enhanced with salon data
      category: "skincare", // Default category - can be enhanced with product categories
      originalPrice,
      finalPrice,
      discount,
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal
      reviews,
      image,
      isSpecialOffer: discount > 10,
      badge: `${discount}% off`,
      description: product.title,
      inStock: product.quantity > 0,
    };
  });
}
