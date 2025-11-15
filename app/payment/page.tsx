"use client"
import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import CheckoutPage from "@/components/CheckoutPage"
import {Elements} from "@stripe/react-stripe-js"
import {loadStripe} from "@stripe/stripe-js"
import {isAuthenticated} from "@/lib/api/auth"
import {createOrderWithPayment} from "@/lib/api/orders"
import {getCart} from "@/lib/api/cart"
import type {CartItem} from "@/lib/types/cart"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

// Test cart data for quick testing
const TEST_CART_ITEMS = [
  {
    id: "test-prod-1",
    name: "Luxury Hair Serum",
    price: 45.99,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
  },
  {
    id: "test-prod-2",
    name: "Anti-Aging Face Cream",
    price: 89.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
  },
  {
    id: "test-prod-3",
    name: "Organic Body Lotion",
    price: 29.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
  },
]

// Transform API cart items to display format
interface DisplayCartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

function transformCartItems(apiCartItems: CartItem[]): DisplayCartItem[] {
  return apiCartItems.map((item) => ({
    id: item.productId,
    name: item.product.title,
    price: parseFloat(item.product.price),
    quantity: item.quantity,
    image: item.product.images?.[0] || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
  }))
}

const PaymentPage = () => {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<DisplayCartItem[]>([])
  const [clientSecret, setClientSecret] = useState<string>("")
  const [orderId, setOrderId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fetchingCart, setFetchingCart] = useState(true)
  const [error, setError] = useState<string>("")
  const [useTestData, setUseTestData] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Fetch cart data on mount
  useEffect(() => {
    const fetchCartData = async () => {
      // Check authentication first
      if (!isAuthenticated()) {
        router.push("/signin?redirect=/payment")
        return
      }

      try {
        setFetchingCart(true)
        const response = await getCart()
        const transformedItems = transformCartItems(response.data.cart.cartItems || [])
        setCartItems(transformedItems)
      } catch (err) {
        console.error("Error fetching cart:", err)
        // Don't set error here - allow user to use test data
        setCartItems([])
      } finally {
        setFetchingCart(false)
      }
    }

    fetchCartData()
  }, [router])

  // Use test data or real cart data
  const items = useTestData ? TEST_CART_ITEMS : cartItems
  const amount = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Initialize payment
  const initializePayment = async () => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/signin?redirect=/payment")
      return
    }

    // Check if cart is empty
    if (items.length === 0) {
      setError("Your cart is empty. Please add items or use test data.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")

      // TODO: Implement address selection UI
      // For now using a placeholder addressId
      const addressId = "cmhwaqefs0001likajixwobcw"

      // Call backend to create order and payment intent
      // Backend automatically fetches cart items from the user's cart
      const response = await createOrderWithPayment(addressId)

      setClientSecret(response.data.clientSecret)
      setOrderId(response.data.order.id)
      setInitialized(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize payment. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while fetching cart
  if (fetchingCart) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Show loading state during initialization
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your checkout...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && initialized) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Payment Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Return to Shop
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show setup screen if not initialized
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Test Mode Toggle */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">Testing Mode</h3>
                <p className="text-xs text-yellow-700">
                  Enable to use sample test data instead of your cart
                </p>
              </div>
              <button
                onClick={() => setUseTestData(!useTestData)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useTestData ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useTestData ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {useTestData && (
              <p className="text-xs text-yellow-600 mt-2">
                ✓ Using test data (3 products, ${amount.toFixed(2)})
              </p>
            )}
          </div>

          {/* Cart Preview */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {useTestData ? "Test Checkout" : "Checkout"}
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Your cart is empty. Enable test mode or add items to your cart.
                </p>
                <button
                  onClick={() => setUseTestData(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg mr-2"
                >
                  Use Test Data
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg"
                >
                  Go Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-3xl font-bold text-gray-900">
                    ${amount.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-sm font-semibold text-gray-700">Order Items:</p>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-700">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={initializePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Proceed to Payment
                </button>

                {useTestData && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Test Card:</strong> 4242 4242 4242 4242 | Exp: 12/25 | CVC: 123
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show payment form after initialization
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Payment Request Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Complete Payment
          </h2>
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <span className="text-gray-600">Amount to pay:</span>
            <span className="text-3xl font-bold text-gray-900">${amount.toFixed(2)}</span>
          </div>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">Order summary:</p>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {useTestData && (
            <div className="bg-green-50 border border-green-200 rounded p-2 mb-4">
              <p className="text-xs text-green-700">🧪 Test Mode Active</p>
            </div>
          )}
          <p className="text-sm text-gray-500">Please complete the payment below to proceed.</p>
        </div>

        {/* Stripe Elements */}
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
            }}
          >
            <CheckoutPage amount={amount} orderId={orderId} />
          </Elements>
        )}
      </div>
    </div>
  )
}

export default PaymentPage
