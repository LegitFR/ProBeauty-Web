"use client"
import CheckoutPage from "@/components/CheckoutPage"
import {Elements} from "@stripe/react-stripe-js"
import {loadStripe} from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

function convertToSubcurrency(amount: number) {
    return amount * 100
}

const PaymentPage = () => {
    const amount = 10.00
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Payment Request Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Request</h2>
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <span className="text-gray-600">Amount to pay:</span>
            <span className="text-3xl font-bold text-gray-900">${amount.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500">Please complete the payment below to proceed.</p>
        </div>

        {/* Stripe Elements */}
        <Elements 
          stripe={stripePromise}
          options={{
            mode: "payment",
            amount: convertToSubcurrency(amount), // paise
            currency: "usd",
          }}>
          <CheckoutPage amount={amount} />
        </Elements>
      </div>
    </div>
  )
}

export default PaymentPage
