"use client"
import React, {useState} from "react"
import {useStripe, useElements, PaymentElement} from "@stripe/react-stripe-js"

interface CheckoutPageProps {
  amount: number
  orderId: string
}

function CheckoutPage({amount, orderId}: CheckoutPageProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(undefined)

    if (!stripe || !elements) {
      setLoading(false)
      return
    }

    const {error: submitError} = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message)
      setLoading(false)
      return
    }

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?orderId=${orderId}&amount=${amount}`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <PaymentElement />
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>
    </form>
  )
}

export default CheckoutPage
