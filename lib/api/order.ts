/**
 * Order API Client Functions
 * Handles product orders
 */

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
  }
): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
  }

  const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return await response.json();
}

/**
 * Get a specific order by ID
 */
export async function getOrderById(
  token: string,
  orderId: string
): Promise<SingleOrderResponse> {
  const response = await fetch(`${API_BASE_URL}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch order");
  }

  return await response.json();
}

/**
 * Create a new order from cart
 */
export async function createOrder(
  token: string,
  data: {
    addressId: string;
    notes?: string;
  }
): Promise<SingleOrderResponse> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to create order" }));
    throw new Error(errorData.message || "Failed to create order");
  }

  return await response.json();
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  token: string,
  orderId: string
): Promise<SingleOrderResponse> {
  const response = await fetch(`${API_BASE_URL}/${orderId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to cancel order" }));
    throw new Error(errorData.message || "Failed to cancel order");
  }

  return await response.json();
}
