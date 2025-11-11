"use client"
import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const amount = searchParams.get("amount")
    const [transactionId] = useState(() => 
        Math.random().toString(36).substring(2, 15).toUpperCase()
    )

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
                    Thank you for your purchase. Your payment has been processed successfully.
                </p>

                {/* Amount Display */}
                {amount && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                        <p className="text-4xl font-bold text-gray-800">
                            ${parseFloat(amount).toFixed(2)}
                        </p>
                    </div>
                )}

                {/* Transaction Details */}
                <div className="border-t border-gray-200 pt-6 mb-8">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-semibold text-gray-800">
                            {transactionId}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-semibold text-gray-800">Card</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-gray-800">
                            {new Date().toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
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
