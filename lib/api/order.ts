/**
 * Order API Client Functions
 * Handles product orders
 */

import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/orders";

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product?: {
    id: string;
    salonId: string;
    title: string;
    sku: string;
    price: string;
    quantity: number;
    images?: string[];
  };
}

export interface Order {
  id: string;
  userId: string;
  salonId: string;
  total: string;
  status: OrderStatus;
  createdAt: string;
  salon?: {
    id: string;
    ownerId: string;
    name: string;
    address: string;
    verified: boolean;
  };
  orderItems?: OrderItem[];
}

export interface OrdersResponse {
  message: string;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleOrderResponse {
  message: string;
  data: Order;
}

export interface CreateOrderRequest {
  addressId: string;
  notes?: string;
}

/**
 * Get all orders for the authenticated user
 */
export async function getOrders(
  token: string,
  filters?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    salonId?: string;
  },
): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
  }

  return await fetchJsonWithAuth<OrdersResponse>(
    `${API_BASE_URL}?${queryParams}`,
    {
      method: "GET",
    },
  );
}

/**
 * Get a specific order by ID
 */
export async function getOrderById(
  token: string,
  orderId: string,
): Promise<SingleOrderResponse> {
  return await fetchJsonWithAuth<SingleOrderResponse>(
    `${API_BASE_URL}/${orderId}`,
    {
      method: "GET",
    },
  );
}

/**
 * Create a new order from cart
 */
export async function createOrder(
  token: string,
  data: CreateOrderRequest,
): Promise<SingleOrderResponse> {
  try {
    return await fetchJsonWithAuth<SingleOrderResponse>(API_BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    throw error;
  }
}

/**
 * Update order status (salon owner only)
 */
export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus,
): Promise<SingleOrderResponse> {
  return await fetchJsonWithAuth<SingleOrderResponse>(
    `${API_BASE_URL}/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  token: string,
  orderId: string,
): Promise<SingleOrderResponse> {
  return await fetchJsonWithAuth<SingleOrderResponse>(
    `${API_BASE_URL}/${orderId}/cancel`,
    {
      method: "POST",
    },
  );
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrdersAdmin(
  token: string,
  filters?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    salonId?: string;
  },
): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
  }

  return await fetchJsonWithAuth<OrdersResponse>(
    `${API_BASE_URL}/admin?${queryParams}`,
    {
      method: "GET",
    },
  );
}
