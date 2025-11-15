"use client"
import React, {useState, useEffect} from "react"
import {useSearchParams, useRouter} from "next/navigation"
import Link from "next/link"
import {useCart} from "@/components/CartContext"
import {pollOrderStatus, getOrderPayment} from "@/lib/api/orders"
import type {Order, Payment} from "@/lib/types/order"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const {clearCart} = useCart()

  const orderId = searchParams.get("orderId")
  const amount = searchParams.get("amount")

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [error, setError] = useState<string>("")
  const [paymentFailed, setPaymentFailed] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setError("No order ID found. Please try again.")
      setLoading(false)
      return
    }

    async function checkOrderStatus() {
      try {
        setLoading(true)

        // Poll order status until confirmed or failed
        const orderResponse = await pollOrderStatus(orderId)
        setOrder(orderResponse.data)

        // Check if payment succeeded
        if (orderResponse.data.status === "CONFIRMED") {
          // Get payment details
          const paymentResponse = await getOrderPayment(orderId)
          if (paymentResponse.data.length > 0) {
            setPayment(paymentResponse.data[0])
          }

          // Clear cart on successful payment
          clearCart()
        } else if (orderResponse.data.status === "PAYMENT_FAILED") {
          setPaymentFailed(true)

          // Get payment details to show failure reason
          try {
            const paymentResponse = await getOrderPayment(orderId)
            if (paymentResponse.data.length > 0) {
              setPayment(paymentResponse.data[0])
            }
          } catch {
            // Ignore payment fetch error
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    checkOrderStatus()
  }, [orderId, clearCart])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Confirming Your Payment...
          </h2>
          <p className="text-gray-600">Please wait while we verify your payment.</p>
        </div>
      </div>
    )
  }

  // Payment failed state
  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <svg
                className="w-16 h-16 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            {payment?.failureReason ||
              "Your payment could not be processed. Please try again."}
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold text-gray-800">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-red-600">{order.status}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push("/payment")}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-8">
            {error || "Could not load order details. Please try again."}
          </p>
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-green-100 rounded-full p-4">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {/* Amount Display */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
          <p className="text-4xl font-bold text-gray-800">
            ${amount ? parseFloat(amount).toFixed(2) : order.total}
          </p>
        </div>

        {/* Order Details */}
        <div className="border-t border-gray-200 pt-6 mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-semibold text-gray-800">{order.id}</span>
          </div>
          {payment && (
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-semibold text-gray-800">
                {payment.txnId.substring(0, 20)}...
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-semibold text-gray-800">
              {payment?.provider || "Card"}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold text-green-600">{order.status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold text-gray-800">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Return to Home
          </Link>
          <button
            onClick={() => window.print()}
            className="block w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Print Receipt
          </button>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 mt-8">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  )
}
