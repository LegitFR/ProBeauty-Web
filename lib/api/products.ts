/**
 * Server-side API functions for fetching products
 * These functions should ONLY be called from Server Components
 * to keep the API URL secure and not exposed to the client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

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
 * Fetches all products from the backend API
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
 * Transforms API products to display format with fallback values
 * @param apiProducts - Products from the API
 * @returns Array of display-ready products
 */
export function transformProducts(apiProducts: ApiProduct[]): DisplayProduct[] {
  return apiProducts.map((product) => {
    // Use first image or placeholder
    const image =
      product.images && product.images.length > 0
        ? product.images[0]
        : "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400";

    // Calculate discount (you can enhance this based on your business logic)
    const discount = Math.floor(Math.random() * 20) + 5; // Random 5-25% for demo
    const originalPrice = product.price;
    const finalPrice = Math.round(originalPrice * (1 - discount / 100));

    return {
      id: product.id,
      name: product.title,
      brand: "ProBeauty", // Default brand - can be enhanced with salon data
      category: "skincare", // Default category - can be enhanced with product categories
      originalPrice,
      finalPrice,
      discount,
      rating: 4.5 + Math.random() * 0.5, // Random rating 4.5-5.0 for demo
      reviews: Math.floor(Math.random() * 200) + 50, // Random reviews 50-250 for demo
      image,
      isSpecialOffer: discount > 10,
      badge: `${discount}% off`,
      description: product.title,
      inStock: product.quantity > 0,
    };
  });
}
