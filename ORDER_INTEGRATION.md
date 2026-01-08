# Orders & Bookings Stripe Payment Integration

This document describes the integration of the Orders and Bookings APIs with Stripe payment flow.

## Overview

The system has been integrated with Stripe payment processing, allowing users to securely pay for both **product orders** and **service bookings** using Stripe's payment infrastructure. The flow uses webhooks to confirm payments asynchronously.

## Base URL

All API requests are proxied through Next.js API routes to the backend:

- Backend: `https://probeauty-backend.onrender.com`
- Orders Proxy: `/api/orders`
- Orders Checkout: `/api/orders/checkout`
- Bookings Proxy: `/api/bookings`
- Bookings Checkout: `/api/bookings/checkout`

## Payment Flow Architecture

> **⚠️ IMPORTANT - Notification Timing:**  
> Order/Booking notifications should ONLY be sent when payment is confirmed (status: `CONFIRMED`), NOT when created (status: `PAYMENT_PENDING`).  
> See [PAYMENT_NOTIFICATION_FIX.md](PAYMENT_NOTIFICATION_FIX.md) for details on fixing premature notifications.

### Webhook-Driven Payment Confirmation

**Order Payment Flow:**

```
1. User clicks "Proceed to Payment"
2. Frontend calls POST /api/orders/checkout
3. Backend creates Order (PAYMENT_PENDING) + Stripe PaymentIntent
4. Backend returns { clientSecret, orderId, paymentIntentId }
5. Frontend displays Stripe payment form
6. User enters card details
7. Stripe processes payment
8. Stripe sends webhook to backend
9. Backend updates Order status to CONFIRMED
10. Frontend polls order status and shows success
```

**Booking Payment Flow:**

```
1. User selects service, time slot, and staff
2. User clicks "Proceed to Payment"
3. Frontend calls POST /api/bookings/checkout
4. Backend creates Booking (PAYMENT_PENDING) + Stripe PaymentIntent
5. Backend returns { clientSecret, bookingId, paymentIntentId }
6. Frontend displays Stripe payment form
7. User enters card details
8. Stripe processes payment
9. Stripe sends webhook to backend
10. Backend updates Booking status to CONFIRMED
11. Frontend polls booking status and shows success
```

## Integration Points

### 1. Stripe Payment Flow

**Location:** [app/checkout/page.tsx](app/checkout/page.tsx)

#### Step 1: Initialize Checkout Session

1. User fills in shipping address (or selects from saved addresses)
2. User optionally adds delivery instructions/notes (max 500 characters)
3. User clicks "Proceed to Payment" button
4. System calls `/api/orders/checkout` with:
   - `addressId`: Selected address ID
   - `notes`: Optional delivery instructions
5. Backend creates:
   - Order with `PAYMENT_PENDING` status
   - Stripe PaymentIntent
   - Payment record
6. Backend returns:
   - `clientSecret`: For Stripe Elements
   - `orderId`: For tracking
   - `paymentIntentId`: Stripe transaction ID

#### Step 2: Complete Payment

1. Stripe payment form appears with `clientSecret`
2. User enters card details (handled by Stripe Elements)
3. User clicks "Pay Now"
4. Stripe processes payment securely
5. On success: User redirected to `/payment-success?orderId=xxx`
6. On error: Error message displayed

#### Step 3: Payment Confirmation (Webhook)

1. Stripe sends `payment_intent.succeeded` webhook to backend
2. Backend verifies webhook signature
3. Backend updates Payment status to `succeeded`
4. Backend updates Order status to `CONFIRMED`
5. Cart is cleared (already cleared during order creation)

#### Step 4: Status Polling

1. Payment success page polls order status every 2 seconds
2. When status changes to `CONFIRMED`, shows success message
3. If status becomes `PAYMENT_FAILED`, shows error
4. Timeout after 60 seconds

### 2. API Endpoints

**Orders Location:** [lib/api/order.ts](lib/api/order.ts)

Available order functions:

```typescript
// Create order from cart
createOrder(token: string, data: CreateOrderRequest): Promise<SingleOrderResponse>

// Get all user orders with pagination/filters
getOrders(token: string, filters?: {...}): Promise<OrdersResponse>

// Get single order details
getOrderById(token: string, orderId: string): Promise<SingleOrderResponse>

// Update order status (salon owner only)
updateOrderStatus(token: string, orderId: string, status: OrderStatus): Promise<SingleOrderResponse>

// Cancel an order
cancelOrder(token: string, orderId: string): Promise<SingleOrderResponse>

// Get all orders (admin only)
getAllOrdersAdmin(token: string, filters?: {...}): Promise<OrdersResponse>
```

**Bookings Location:** [lib/api/booking.ts](lib/api/booking.ts)

Available booking functions:

```typescript
// Create booking
createBooking(token: string, data: CreateBookingRequest): Promise<SingleBookingResponse>

// Get all user bookings
getBookings(token: string, filters?: {...}): Promise<BookingsResponse>

// Get single booking details
getBookingById(token: string, bookingId: string): Promise<SingleBookingResponse>

// Cancel a booking
cancelBooking(token: string, bookingId: string): Promise<SingleBookingResponse>
```

### 3. API Routes (Proxies)

**Order Routes:** `app/api/orders/`

- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (user orders)
- `GET /api/orders/admin` - Get all orders (admin only)
- `GET /api/orders/[id]` - Get order details
- `GET /api/orders/[id]/payment` - Get payment details for order
- `PATCH /api/orders/[id]/status` - Update order status (salon owner only)
- `POST /api/orders/[id]/cancel` - Cancel order
- `POST /api/orders/checkout` - Create checkout session with Stripe

**Booking Routes:** `app/api/bookings/`

- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings (user bookings)
- `GET /api/bookings/[id]` - Get booking details
- `GET /api/bookings/[id]/payment` - Get payment details for booking
- `POST /api/bookings/[id]/confirm` - Confirm booking
- `POST /api/bookings/[id]/complete` - Complete booking
- `POST /api/bookings/checkout` - Create checkout session with Stripe

All routes require authentication via Bearer token.

## Order Creation Request

```typescript
{
  addressId: string;  // Required - CUID format
  notes?: string;     // Optional - Max 500 characters
}
```

## Order Creation Response

```json
{
  "message": "Order created successfully",
  "data": {
    "id": "clx1order12345678",
    "userId": "clx9876543210abcdefghijk",
    "salonId": "clx1salon12345678",
    "total": "104.98",
    "status": "PENDING",
    "createdAt": "2025-11-02T15:30:00.000Z",
    "orderItems": [...]
  }
}
```

## Order Status Flow

```
PENDING → PAYMENT_PENDING → CONFIRMED → SHIPPED → DELIVERED
   ↓           ↓      ↓         ↓
CANCELLED  PAYMENT_FAILED  CANCELLED
              ↓
          PAYMENT_PENDING (retry)
              ↓
          CANCELLED
```

## Booking Status Flow

```
PENDING → PAYMENT_PENDING → CONFIRMED → COMPLETED
   ↓           ↓               ↓
CANCELLED  PAYMENT_FAILED  CANCELLED
              ↓
          PAYMENT_PENDING (retry)
              ↓
          CANCELLED
```

## Payment Status Flow

```
pending → processing → succeeded
              ↓
           failed / canceled → refunded
```

### Valid Order Status Transitions

- `PENDING` → `PAYMENT_PENDING`, `CONFIRMED`, `CANCELLED`
- `PAYMENT_PENDING` → `CONFIRMED`, `PAYMENT_FAILED`, `CANCELLED`
- `PAYMENT_FAILED` → `PAYMENT_PENDING` (retry), `CANCELLED`
- `CONFIRMED` → `SHIPPED`, `CANCELLED`
- `SHIPPED` → `DELIVERED`
- `DELIVERED` → (terminal state)
- `CANCELLED` → (terminal state)

### Valid Booking Status Transitions

- `PENDING` → `PAYMENT_PENDING`, `CONFIRMED`, `CANCELLED`
- `PAYMENT_PENDING` → `CONFIRMED`, `PAYMENT_FAILED`, `CANCELLED`
- `PAYMENT_FAILED` → `PAYMENT_PENDING` (retry), `CANCELLED`
- `CONFIRMED` → `COMPLETED`, `CANCELLED`
- `COMPLETED` → (terminal state)
- `CANCELLED` → (terminal state)

### Cancellation Rules

Orders can be cancelled when their status is:

- `PENDING`
- `PAYMENT_PENDING`
- `PAYMENT_FAILED`
- `CONFIRMED`

Bookings can be cancelled when their status is:

- `PENDING`
- `PAYMENT_PENDING`
- `PAYMENT_FAILED`
- `CONFIRMED`

Orders/Bookings cannot be cancelled when:

- `SHIPPED` - Already in transit
- `DELIVERED` - Already received
- `CANCELLED` - Already cancelled

## Features Implemented

✅ **Order Creation from Cart**

- Integrated with checkout flow
- Requires authentication
- Uses selected address
- Supports optional delivery notes
- Creates Stripe PaymentIntent
- Returns clientSecret for frontend payment

✅ **Booking Creation**

- Integrated with booking flow
- Requires authentication
- Service, time slot, and staff selection
- Creates Stripe PaymentIntent
- Returns clientSecret for frontend payment

✅ **Payment Processing**

- Stripe Elements integration
- Webhook-driven confirmation
- Status polling for real-time updates
- Support for both orders and bookings
- Payment status tracking
- Idempotency with stripeEventId

✅ **Payment Status Endpoints**

- GET /api/orders/[id]/payment - View order payment details
- GET /api/bookings/[id]/payment - View booking payment details

✅ **Cart Clearing**

- Automatically clears cart after successful order
- Handled for both authenticated and guest users

✅ **Address Management**

- Select from saved addresses
- Add new address during checkout
- Auto-populate form with selected address

✅ **Order Notes**

- Optional delivery instructions field
- 500 character limit
- Character counter display

✅ **Error Handling**

- Validates authentication
- Validates address selection
- Shows user-friendly error messages
- Handles API errors gracefully

✅ **Success Page**

- Redirects to payment success page
- Displays order/booking ID
- Status polling for confirmation
- Links to order/booking details
- Handles both orders and bookings
- Different UI for orders vs bookings

✅ **Order Management in Profile**

- View order history with pagination support
- Filter by status and salon
- Detailed order view with all items
- Order cancellation for eligible statuses
- Status-based badge colors (PENDING, PAYMENT_PENDING, PAYMENT_FAILED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- View salon information
- Track order lifecycle

✅ **Booking Management in Profile**

- View booking history
- Detailed booking view
- Booking cancellation for eligible statuses
- View service and staff details
- Track appointment status
- Status-based badge colors (PENDING, PAYMENT_PENDING, PAYMENT_FAILED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- View salon information
- Track order lifecycle

## Backend API Features

The backend handles:

- ✅ Cart validation (stock availability, single salon per order)
- ✅ Inventory reduction
- ✅ Order creation with transaction safety
- ✅ Cart clearing after successful order
- ✅ Status management with valid transitions
- ✅ Order cancellation with inventory restoration

## Testing

To test the integration:

1. **Add items to cart** (authenticated user)
2. **Go to checkout** at `/checkout`
3. **Select or add address**
4. **Add delivery notes** (optional)
5. **Select payment method**
6. **Click "Place Order"**
7. **Verify order creation** in console logs
8. **Check success page** with order ID
9. **Verify cart is cleared**

## Error Scenarios Handled

**Orders:**

- ❌ User not authenticated → Shows auth modal
- ❌ No address selected → Error + redirect to step 1
- ❌ Cart empty → Backend error
- ❌ Insufficient stock → Backend error with details
- ❌ Multiple salons in cart → Backend error
- ❌ Invalid address → Backend 404 error
- ❌ Network errors → Generic error message

**Bookings:**

- ❌ User not authenticated → Shows auth modal
- ❌ Service not available → Backend error
- ❌ Time slot already booked → Backend error
- ❌ Invalid booking details → Validation error
- ❌ Network errors → Generic error message

**Payment:**

- ❌ Stripe not loaded → User-friendly message
- ❌ Payment declined → Error from Stripe
- ❌ Payment timeout → Timeout message after 60s
- ❌ Webhook failure → Backend logs and retry

## Future Enhancements

- [x] Payment gateway integration (Stripe)
- [x] Order tracking page (Profile page - Orders tab)
- [x] Booking tracking page (Profile page - Appointments tab)
- [ ] Email notifications
- [x] Order history in profile
- [x] Booking history in profile
- [x] Status update functionality (salon owner)
- [x] Payment status endpoints
- [ ] Retry failed payments UI
- [ ] Invoice generation
- [x] Admin order management endpoint
- [x] Booking checkout with payment
- [x] Unified payment success page

## Related Files

**Orders:**

- [app/checkout/page.tsx](app/checkout/page.tsx) - Checkout page with order integration
- [lib/api/order.ts](lib/api/order.ts) - Order API client
- [app/api/orders/route.ts](app/api/orders/route.ts) - Order API proxy routes
- [app/api/orders/checkout/route.ts](app/api/orders/checkout/route.ts) - Order checkout with Stripe
- [app/api/orders/[id]/payment/route.ts](app/api/orders/[id]/payment/route.ts) - Order payment details
- [lib/hooks/useOrderStatus.ts](lib/hooks/useOrderStatus.ts) - Order status polling hook

**Bookings:**

- [lib/api/booking.ts](lib/api/booking.ts) - Booking API client
- [app/api/bookings/route.ts](app/api/bookings/route.ts) - Booking API proxy routes
- [app/api/bookings/checkout/route.ts](app/api/bookings/checkout/route.ts) - Booking checkout with Stripe
- [app/api/bookings/[id]/payment/route.ts](app/api/bookings/[id]/payment/route.ts) - Booking payment details
- [lib/hooks/useBookingStatus.ts](lib/hooks/useBookingStatus.ts) - Booking status polling hook

**Shared:**

- [app/payment-success/page.tsx](app/payment-success/page.tsx) - Unified success page for orders and bookings
- [components/StripePaymentForm.tsx](components/StripePaymentForm.tsx) - Stripe payment form component
- [lib/stripe/config.ts](lib/stripe/config.ts) - Stripe configuration
- [lib/api/cart.ts](lib/api/cart.ts) - Cart API client
- [lib/api/address.ts](lib/api/address.ts) - Address API client
