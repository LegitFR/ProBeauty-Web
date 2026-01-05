# Orders & Stripe Payment Integration

This document describes the integration of the Orders API and Stripe payment flow with the checkout functionality.

## Overview

The system has been integrated with Stripe payment processing, allowing users to securely pay for their orders using Stripe's payment infrastructure. The flow uses webhooks to confirm payments asynchronously.

## Base URL

All API requests are proxied through Next.js API routes to the backend:

- Backend: `https://probeauty-backend.onrender.com`
- Proxy: `/api/orders`
- Checkout Proxy: `/api/orders/checkout`

## Payment Flow Architecture

> **⚠️ IMPORTANT - Notification Timing:**  
> Order notifications should ONLY be sent when payment is confirmed (status: `CONFIRMED`), NOT when the order is created (status: `PAYMENT_PENDING`).  
> See [PAYMENT_NOTIFICATION_FIX.md](PAYMENT_NOTIFICATION_FIX.md) for details on fixing premature notifications.

### Webhook-Driven Payment Confirmation

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

**Location:** [lib/api/order.ts](lib/api/order.ts)

Available functions:

```typescript
// Create order from cart
createOrder(token: string, data: CreateOrderRequest): Promise<SingleOrderResponse>

// Get all user orders with pagination/filters
getOrders(token: string, filters?: {...}): Promise<OrdersResponse>

// Get single order details
getOrderById(token: string, orderId: string): Promise<SingleOrderResponse>

// Cancel an order
cancelOrder(token: string, orderId: string): Promise<SingleOrderResponse>
```

### 3. API Routes (Proxies)

**Location:** `app/api/orders/`

- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders/[id]/cancel` - Cancel order

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
   ↓           ↓               ↓
CANCELLED   PAYMENT_FAILED  CANCELLED
```

## Features Implemented

✅ **Order Creation from Cart**

- Integrated with checkout flow
- Requires authentication
- Uses selected address
- Supports optional delivery notes

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
- Displays order ID
- Links to order details
- Links to continue shopping

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

- ❌ User not authenticated → Shows auth modal
- ❌ No address selected → Error + redirect to step 1
- ❌ Cart empty → Backend error
- ❌ Insufficient stock → Backend error with details
- ❌ Multiple salons in cart → Backend error
- ❌ Invalid address → Backend 404 error
- ❌ Network errors → Generic error message

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Order tracking page
- [ ] Email notifications
- [ ] Order history in profile
- [ ] Status update webhooks
- [ ] Retry failed payments
- [ ] Invoice generation

## Related Files

- [app/checkout/page.tsx](app/checkout/page.tsx) - Checkout page with order integration
- [lib/api/order.ts](lib/api/order.ts) - Order API client
- [app/api/orders/route.ts](app/api/orders/route.ts) - Order API proxy routes
- [app/payment-success/page.tsx](app/payment-success/page.tsx) - Success page
- [lib/api/cart.ts](lib/api/cart.ts) - Cart API client
- [lib/api/address.ts](lib/api/address.ts) - Address API client
