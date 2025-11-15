# Payment Flow Documentation

Complete guide to how the Stripe payment integration works on the client side.

---

## 🔄 Payment Flow Overview

```
User adds products to cart
         ↓
Navigate to /payment page
         ↓
User reviews order and clicks "Proceed to Payment"
         ↓
Frontend calls Backend API
         ↓
Backend creates Order (PAYMENT_PENDING) + Stripe PaymentIntent
         ↓
Backend returns clientSecret + orderId
         ↓
Stripe Elements renders payment form
         ↓
User enters card details and submits
         ↓
Stripe processes payment (client-side confirmation)
         ↓
Stripe redirects to /payment-success page
         ↓
Stripe sends webhook to backend (server-side)
         ↓
Backend updates order status (CONFIRMED/FAILED)
         ↓
Success page polls backend for order status
         ↓
Display order confirmation or error
         ↓
Clear cart (if successful)
```

---

## 📍 Pages & Components

### 1. **Payment Page** (`/app/payment/page.tsx`)

**Route:** `/payment`

**Purpose:** Initialize checkout, display order summary, and render Stripe payment form

**State Management:**
- `clientSecret` - Stripe payment intent secret
- `orderId` - Backend order ID
- `loading` - Loading state during API calls
- `error` - Error messages
- `useTestData` - Toggle between real cart and test data
- `initialized` - Whether payment has been initialized

**Key Functions:**

#### `initializePayment()`
Initializes the checkout process by calling the backend API.

**Steps:**
1. **Check Authentication**
   - Verifies user is logged in via `isAuthenticated()`
   - Redirects to `/signin?redirect=/payment` if not authenticated

2. **Validate Cart**
   - Checks if cart has items
   - Shows error if cart is empty

3. **Prepare Order Data**
   - Maps cart items to order format:
     ```typescript
     {
       productId: string,
       quantity: number,
       price: number
     }
     ```

4. **Call Backend API**
   - **Endpoint:** `POST /api/v1/orders/checkout`
   - **Headers:**
     ```
     Authorization: Bearer {accessToken}
     Content-Type: application/json
     ```
   - **Request Body:**
     ```json
     {
       "items": [
         {
           "productId": "test-prod-1",
           "quantity": 2,
           "price": 45.99
         }
       ],
       "addressId": undefined
     }
     ```

5. **Handle Response**
   - Receives `clientSecret` from Stripe
   - Receives `orderId` from backend
   - Sets `initialized` to true
   - Renders Stripe Elements

**API Request:**
```typescript
POST http://localhost:5000/api/v1/orders/checkout

Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json

Body:
  {
    "items": [
      { "productId": "prod-123", "quantity": 2, "price": 45.99 }
    ],
    "addressId": undefined
  }

Response:
  {
    "message": "Order created successfully. Complete payment to confirm.",
    "data": {
      "order": {
        "id": "clxxx...",
        "userId": "clxxx...",
        "total": "150.00",
        "status": "PAYMENT_PENDING",
        "orderItems": [...]
      },
      "clientSecret": "pi_xxx_secret_xxx",
      "paymentIntentId": "pi_xxx"
    }
  }
```

**Error Handling:**
- Authentication errors → Redirect to login
- Empty cart → Show error message
- API errors → Display error in UI
- Network errors → Show generic error message

---

### 2. **Checkout Component** (`/components/CheckoutPage.tsx`)

**Purpose:** Render Stripe Elements and handle payment confirmation

**Props:**
- `amount: number` - Total amount to charge
- `orderId: string` - Backend order ID for reference

**Key Functions:**

#### `handleSubmit()`
Handles the payment form submission and Stripe confirmation.

**Steps:**
1. **Prevent Default Form Submission**
   ```typescript
   e.preventDefault()
   ```

2. **Validate Stripe Elements**
   - Checks if Stripe.js and Elements are loaded
   - Returns early if not ready

3. **Submit Elements for Validation**
   - Calls `elements.submit()` to validate all inputs
   - Checks for validation errors (invalid card, missing fields, etc.)

4. **Confirm Payment with Stripe**
   - Calls `stripe.confirmPayment()`
   - **Does NOT send to backend** - this is client-side only
   - Stripe handles the payment processing

5. **Redirect on Success**
   - Stripe automatically redirects to `return_url` on success
   - URL format: `/payment-success?orderId={orderId}&amount={amount}`

**Stripe API Call (Client-Side):**
```typescript
const {error} = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: `${window.location.origin}/payment-success?orderId=${orderId}&amount=${amount}`
  }
})

// No backend call here - Stripe handles everything
// Stripe will:
// 1. Process the payment
// 2. Send webhook to backend
// 3. Redirect user to return_url
```

**Error Handling:**
- Card declined → Display Stripe error message
- Network issues → Display error in UI
- Invalid card details → Stripe Elements shows inline errors

---

### 3. **Payment Success Page** (`/app/payment-success/page.tsx`)

**Route:** `/payment-success?orderId={orderId}&amount={amount}`

**Purpose:** Poll backend for order status and display confirmation

**State Management:**
- `loading` - Loading state while polling
- `order` - Order details from backend
- `payment` - Payment details from backend
- `error` - Error messages
- `paymentFailed` - Whether payment failed

**Key Functions:**

#### `checkOrderStatus()` (runs automatically on mount)

**Steps:**
1. **Get Order ID from URL**
   - Reads `orderId` from query params
   - Shows error if missing

2. **Poll Order Status**
   - Calls `pollOrderStatus(orderId)` from API client
   - Polls every 2 seconds for up to 30 seconds
   - Waits for order status to change from `PAYMENT_PENDING`

3. **Check Final Status**
   - If `CONFIRMED` → Payment succeeded
   - If `PAYMENT_FAILED` → Payment failed

4. **Fetch Payment Details** (if confirmed)
   - Calls backend to get payment information
   - Displays transaction ID and payment method

5. **Clear Cart** (if successful)
   - Calls `clearCart()` from CartContext
   - Removes all items from cart

**API Requests:**

#### Request 1: Poll Order Status
```typescript
GET http://localhost:5000/api/v1/orders/{orderId}

Headers:
  Authorization: Bearer {accessToken}

Response:
  {
    "message": "Order retrieved successfully",
    "data": {
      "id": "clxxx...",
      "userId": "clxxx...",
      "total": "150.00",
      "status": "CONFIRMED",  // or "PAYMENT_FAILED"
      "createdAt": "2024-01-01T00:00:00.000Z",
      "orderItems": [...]
    }
  }

// Polls every 2 seconds until status changes
// Max 15 attempts (30 seconds total)
```

#### Request 2: Get Payment Details
```typescript
GET http://localhost:5000/api/v1/orders/{orderId}/payment

Headers:
  Authorization: Bearer {accessToken}

Response:
  {
    "message": "Payment details retrieved successfully",
    "data": [
      {
        "id": "clxxx...",
        "orderId": "clxxx...",
        "provider": "stripe",
        "amount": "150.00",
        "status": "succeeded",
        "txnId": "pi_xxx",
        "stripeEventId": "evt_xxx",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:05:00.000Z"
      }
    ]
  }
```

**Polling Logic:**
```typescript
// Defined in lib/api/orders.ts
export async function pollOrderStatus(
  orderId: string,
  maxAttempts: number = 15,      // Max polls
  intervalMs: number = 2000       // 2 second intervals
): Promise<GetOrderResponse> {
  // Polls backend until:
  // 1. Order status is CONFIRMED
  // 2. Order status is PAYMENT_FAILED
  // 3. Max attempts reached (30 seconds)

  // Returns final order status
}
```

---

## 🔌 Backend API Endpoints Used

### 1. **Create Order with Payment**
```
POST /api/v1/orders/checkout
```
- **Authentication:** Required (JWT Bearer token)
- **Purpose:** Create order in backend and Stripe PaymentIntent
- **Request:** Order items with product IDs, quantities, prices
- **Response:** Order details, clientSecret, paymentIntentId

### 2. **Get Order by ID**
```
GET /api/v1/orders/{orderId}
```
- **Authentication:** Required (JWT Bearer token)
- **Purpose:** Retrieve order details and status
- **Request:** Order ID in URL
- **Response:** Order object with current status

### 3. **Get Order Payment Details**
```
GET /api/v1/orders/{orderId}/payment
```
- **Authentication:** Required (JWT Bearer token)
- **Purpose:** Retrieve payment information for an order
- **Request:** Order ID in URL
- **Response:** Array of payment records

---

## 🔐 Authentication Flow

All backend API calls use JWT authentication via `fetchWithAuth()` utility:

```typescript
// lib/api/auth.ts
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Get access token from localStorage
  const accessToken = getAccessToken()

  // 2. Add Authorization header
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`
    }
  })

  // 3. If 401 (token expired), refresh token
  if (response.status === 401) {
    const refreshToken = getRefreshToken()
    const { accessToken: newToken } = await refreshAccessToken(refreshToken)

    // 4. Retry request with new token
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`
      }
    })
  }

  return response
}
```

**Token Storage:**
- Access Token: `localStorage.getItem('accessToken')`
- Refresh Token: `localStorage.getItem('refreshToken')`
- User Info: `localStorage.getItem('user')`

---

## 📦 Complete Payment Steps

### **Step 1: User Adds Products to Cart**

**Location:** Any product page
**Component:** CartContext
**Action:** `addToCart(product)`

```typescript
// Cart stores items in memory (React Context)
const cart = [
  {
    id: "prod-123",
    name: "Luxury Hair Serum",
    price: 45.99,
    quantity: 2,
    image: "https://..."
  }
]
```

---

### **Step 2: Navigate to Payment Page**

**URL:** `/payment`
**Requirement:** User must be logged in
**If not logged in:** Redirects to `/signin?redirect=/payment`

---

### **Step 3: Review Order**

**Page:** Payment Page (Setup Screen)
**User sees:**
- Test mode toggle (optional)
- Cart items with quantities
- Total amount
- "Proceed to Payment" button

---

### **Step 4: Initialize Payment**

**Action:** User clicks "Proceed to Payment"
**What happens:**

1. Frontend validates cart is not empty
2. Frontend checks user authentication
3. Frontend calls backend API:
   ```
   POST /api/v1/orders/checkout
   ```
4. Backend creates:
   - Order record (status: PAYMENT_PENDING)
   - Stripe PaymentIntent
   - Payment record in database
5. Backend returns:
   - `clientSecret` (for Stripe)
   - `orderId` (for tracking)
6. Frontend receives response and renders Stripe Elements

---

### **Step 5: Enter Card Details**

**Page:** Payment Page (Payment Form)
**User sees:**
- Order summary
- Stripe Elements payment form
- "Pay $XX.XX" button

**User enters:**
- Card number: `4242 4242 4242 4242` (test card)
- Expiry date: `12/25`
- CVC: `123`
- ZIP: `12345`

---

### **Step 6: Submit Payment**

**Action:** User clicks "Pay" button
**What happens (client-side):**

1. Stripe Elements validates card details
2. Frontend calls `stripe.confirmPayment()`
3. Stripe processes payment (happens on Stripe servers)
4. Stripe automatically redirects to success page

**NO backend API call at this step** - Stripe handles everything

---

### **Step 7: Stripe Webhook (Background)**

**What happens (server-side):**

1. Stripe sends webhook to backend:
   ```
   POST /api/v1/webhooks/stripe
   ```
2. Backend receives event: `payment_intent.succeeded`
3. Backend verifies webhook signature
4. Backend updates:
   - Payment status → `succeeded`
   - Order status → `CONFIRMED`
5. Backend returns `200 OK` to Stripe

**This happens in the background while user is being redirected**

---

### **Step 8: Payment Success Page**

**URL:** `/payment-success?orderId=xxx&amount=xxx`
**What happens:**

1. Page extracts `orderId` from URL
2. Page starts polling backend:
   ```
   GET /api/v1/orders/{orderId}
   ```
3. Polls every 2 seconds for up to 30 seconds
4. Waits for order status to change from `PAYMENT_PENDING` to `CONFIRMED`
5. When confirmed, fetches payment details:
   ```
   GET /api/v1/orders/{orderId}/payment
   ```
6. Displays order confirmation with:
   - Order ID
   - Transaction ID
   - Payment amount
   - Order date
7. Clears the cart

---

### **Step 9: Order Confirmation**

**User sees:**
- ✓ Success icon
- Order ID
- Transaction ID
- Payment amount
- Order date
- "Return to Home" button
- "Print Receipt" button

**Cart is now empty** - items have been removed

---

## ⚠️ Error Scenarios

### **1. User Not Authenticated**

**When:** Accessing `/payment` without being logged in
**Result:** Redirects to `/signin?redirect=/payment`
**After login:** Returns to payment page

---

### **2. Empty Cart**

**When:** Accessing `/payment` with no items in cart
**Result:** Shows message "Your cart is empty"
**Options:**
- Enable test mode
- Go back to shopping

---

### **3. Backend API Error**

**When:** Backend returns error during checkout
**Examples:**
- Out of stock
- Invalid product ID
- Server error

**Result:** Displays error message with "Return to Shop" button

---

### **4. Payment Declined**

**When:** Card is declined by Stripe
**What happens:**

1. Stripe returns error to frontend
2. Frontend displays error in payment form
3. User can try again with different card
4. Webhook sends `payment_intent.payment_failed`
5. Backend updates order status to `PAYMENT_FAILED`

**Success page shows:**
- ✗ Error icon
- Failure reason (from Stripe)
- Order ID (for reference)
- "Try Again" button

---

### **5. Webhook Timeout**

**When:** Webhook doesn't update order status within 30 seconds
**What happens:**

1. Polling reaches max attempts
2. Success page still shows current order status
3. User can manually refresh or contact support

**Why this might happen:**
- Backend server down
- Webhook endpoint misconfigured
- Stripe webhook delayed

---

## 🔄 Webhook Processing (Backend)

While this is backend logic, it's important to understand the flow:

### **Webhook Event: `payment_intent.succeeded`**

```
1. Stripe calls: POST /api/v1/webhooks/stripe
2. Backend receives event data
3. Backend verifies signature (security)
4. Backend extracts PaymentIntent ID
5. Backend finds Payment record by txnId
6. Backend updates Payment:
   - status: "succeeded"
   - stripeEventId: event.id
7. Backend finds Order by Payment
8. Backend updates Order:
   - status: "CONFIRMED"
9. Backend returns 200 OK to Stripe
```

### **Webhook Event: `payment_intent.payment_failed`**

```
1. Stripe calls: POST /api/v1/webhooks/stripe
2. Backend processes event
3. Backend updates Payment:
   - status: "failed"
   - failureReason: event.data.last_payment_error.message
4. Backend updates Order:
   - status: "PAYMENT_FAILED"
5. Backend returns 200 OK
```

---

## 📊 Order Status Transitions

```
PENDING
   ↓ (user clicks checkout)
PAYMENT_PENDING
   ↓ (webhook: payment_intent.succeeded)
CONFIRMED
   ↓ (admin ships order)
SHIPPED
   ↓ (order delivered)
DELIVERED

OR

PAYMENT_PENDING
   ↓ (webhook: payment_intent.payment_failed)
PAYMENT_FAILED
   ↓ (user cancels)
CANCELLED
```

---

## 🛠️ Development Notes

### **Environment Variables Required**

```env
# Frontend (.env)
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

### **Backend Must Be Running**

```bash
# Backend server
http://localhost:5000

# Endpoints must be available:
POST /api/v1/orders/checkout
GET  /api/v1/orders/:id
GET  /api/v1/orders/:id/payment
POST /api/v1/webhooks/stripe
```

### **Stripe Webhook Setup**

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe
```

For production:
1. Add webhook endpoint in Stripe Dashboard
2. Select events: `payment_intent.*`, `charge.refunded`
3. Copy webhook signing secret to backend `.env`

---

## 📝 Summary

### **Frontend API Calls:**
1. `POST /orders/checkout` - Create order and payment intent
2. `GET /orders/{id}` - Poll order status (every 2s, max 30s)
3. `GET /orders/{id}/payment` - Get payment details

### **Stripe Client Calls:**
1. `stripe.confirmPayment()` - Submit payment (client-side only)

### **Backend Webhook (Automatic):**
1. Stripe → `POST /webhooks/stripe` - Update order status

### **User Journey:**
```
Cart → Payment Setup → Initialize → Enter Card → Submit →
Redirected to Success → Poll Status → Show Confirmation → Clear Cart
```

---

**That's the complete payment flow!** 🎉
