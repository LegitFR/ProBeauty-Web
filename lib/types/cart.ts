// Cart API Type Definitions

export interface CartProduct {
  id: string
  salonId: string
  title: string
  sku: string
  price: string
  quantity: number
  images: string[]
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: CartProduct
}

export interface Cart {
  id: string
  userId: string
  createdAt: string
  cartItems: CartItem[]
}

export interface CartSummary {
  totalItems: number
  subtotal: number
  itemCount: number
}

export interface GetCartResponse {
  message: string
  data: {
    cart: Cart
    summary: CartSummary
  }
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}

export interface AddToCartResponse {
  message: string
  data: CartItem
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface UpdateCartItemResponse {
  message: string
  data: CartItem
}

export interface RemoveFromCartResponse {
  message: string
}

export interface ClearCartResponse {
  message: string
}
