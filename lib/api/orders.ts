/**
 * Orders API Client
 * Handles order creation, payment, and order status polling
 */

import { fetchWithAuth } from "./auth"
import type {
  CreateOrderWithPaymentResponse,
  GetOrderResponse,
  GetOrderPaymentResponse,
} from "../types/order"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || ""

/**
 * Create order with payment intent
 * This endpoint creates an order in PAYMENT_PENDING status and returns a Stripe clientSecret
 * Backend automatically fetches cart items from the user's cart
 *
 * @param addressId - The delivery address ID for the order
 */
export async function createOrderWithPayment(
  addressId: string
): Promise<CreateOrderWithPaymentResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addressId }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to create order")
    }

    return result
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred while creating the order"
    throw new Error(errorMessage)
  }
}

/**
 * Get order by ID
 * Used for polling order status after payment
 */
export async function getOrderById(orderId: string): Promise<GetOrderResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/${orderId}`, {
      method: "GET",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch order")
    }

    return result
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred while fetching the order"
    throw new Error(errorMessage)
  }
}

/**
 * Get payment details for an order
 */
export async function getOrderPayment(
  orderId: string
): Promise<GetOrderPaymentResponse> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/orders/${orderId}/payment`,
      {
        method: "GET",
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch payment details")
    }

    return result
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred while fetching payment details"
    throw new Error(errorMessage)
  }
}

/**
 * Poll order status until it's confirmed or failed
 * Polls every 2 seconds for up to 30 seconds
 */
export async function pollOrderStatus(
  orderId: string,
  maxAttempts: number = 15,
  intervalMs: number = 2000
): Promise<GetOrderResponse> {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++
        const result = await getOrderById(orderId)

        // Check if order status has been updated by webhook
        if (
          result.data.status === "CONFIRMED" ||
          result.data.status === "PAYMENT_FAILED"
        ) {
          resolve(result)
          return
        }

        // Continue polling if max attempts not reached
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs)
        } else {
          // Timeout - return current status
          resolve(result)
        }
      } catch (error: unknown) {
        reject(error)
      }
    }

    poll()
  })
}
