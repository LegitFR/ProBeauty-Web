export default function PaymentSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful</h1>
        <p className="text-gray-600 mb-8">Thank you for your purchase!</p>
        <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Home
        </a>
      </div>
    </div>
  )
}
