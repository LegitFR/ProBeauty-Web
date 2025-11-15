// Order and Payment Type Definitions

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  userId: string
  salonId: string
  addressId?: string
  total: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
  orderItems?: OrderItem[]
}

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "PAYMENT_FAILED"
  | "CANCELLED"

export interface Payment {
  id: string
  orderId: string
  provider: string
  amount: string
  status: PaymentStatus
  txnId: string
  stripeEventId?: string
  stripeCustomerId?: string
  metadata?: Record<string, unknown>
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded"

export interface CreateOrderWithPaymentResponse {
  message: string
  data: {
    order: Order
    clientSecret: string
    paymentIntentId: string
  }
}

export interface GetOrderResponse {
  message: string
  data: Order
}

export interface GetOrderPaymentResponse {
  message: string
  data: Payment[]
}

// Cart item from CartContext
export interface CartItem {
  id: string | number
  name: string
  price: number
  image: string
  quantity: number
}

// Request body for creating order with payment
// Backend fetches cart items automatically from user's cart
export interface CreateOrderRequest {
  addressId: string
}
