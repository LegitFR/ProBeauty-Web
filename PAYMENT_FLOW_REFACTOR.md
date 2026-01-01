# Payment Flow Refactoring - Better Architecture

## Current Problem

Orders are being created BEFORE payment is completed, causing:

- ❌ Premature order notifications
- ❌ Orders existing without payment
- ❌ Database pollution with unpaid orders
- ❌ Inventory reserved for unpaid orders

## Current Flow (Problematic)

```
POST /api/orders/checkout
  ↓
Backend: Create Order (PAYMENT_PENDING)
  ↓
Backend: Create PaymentIntent linked to Order
  ↓
Return: { orderId, clientSecret, paymentIntentId }
  ↓
User: Enters payment details
  ↓
Stripe: Processes payment
  ↓
Webhook: payment_intent.succeeded
  ↓
Backend: Update Order status to CONFIRMED
```

**Issue:** Order exists in database before payment is confirmed

## Recommended Flow (Better)

```
POST /api/orders/initialize-payment (renamed endpoint)
  ↓
Backend: Validate cart & address (DON'T create order yet)
  ↓
Backend: Create PaymentIntent with cart metadata
  ↓
Return: { clientSecret, paymentIntentId }
  ↓
User: Enters payment details
  ↓
Stripe: Processes payment
  ↓
Webhook: payment_intent.succeeded
  ↓
Backend: Create Order with CONFIRMED status (now!)
  ↓
Backend: Clear cart
  ↓
Backend: Send order confirmation notification
```

**Benefit:** Order only exists after successful payment

## Implementation Guide

### Step 1: Update Checkout Endpoint

**Before:** `POST /api/v1/orders/checkout`

```typescript
async function createCheckout(req, res) {
  // ❌ Creates order before payment
  const order = await createOrder({
    userId,
    cartItems,
    addressId,
    status: "PAYMENT_PENDING",
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.total * 100,
    metadata: { orderId: order.id },
  });

  return { orderId: order.id, clientSecret: paymentIntent.client_secret };
}
```

**After:** `POST /api/v1/payments/initialize`

```typescript
async function initializePayment(req, res) {
  const { userId, addressId, notes } = req.body;

  // 1. Get user's cart
  const cart = await getCart(userId);
  if (!cart.items.length) {
    throw new Error("Cart is empty");
  }

  // 2. Validate cart (single salon, stock availability)
  await validateCart(cart);

  // 3. Get address details
  const address = await getAddress(addressId);

  // 4. Calculate total
  const total = calculateCartTotal(cart);

  // 5. Create PaymentIntent with ALL order data in metadata
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100), // Convert to cents
    currency: "gbp",
    metadata: {
      userId,
      addressId,
      notes: notes || "",
      cartSnapshot: JSON.stringify(
        cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          salonId: item.product.salonId,
        }))
      ),
      salonId: cart.items[0].product.salonId,
      totalAmount: total.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // ✅ NO ORDER CREATED YET

  return res.json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
    },
  });
}
```

### Step 2: Update Webhook Handler

**Before:** Updates existing order

```typescript
async function handlePaymentSucceeded(paymentIntent) {
  // ❌ Assumes order already exists
  const order = await prisma.order.update({
    where: { id: paymentIntent.metadata.orderId },
    data: { status: "CONFIRMED" },
  });

  await sendNotification(order);
}
```

**After:** Creates order after payment succeeds

```typescript
async function handlePaymentSucceeded(paymentIntent) {
  const { userId, addressId, notes, cartSnapshot, salonId, totalAmount } =
    paymentIntent.metadata;

  // Parse cart items from metadata
  const cartItems = JSON.parse(cartSnapshot);

  // ✅ CREATE ORDER NOW (after payment confirmed)
  const order = await prisma.order.create({
    data: {
      userId,
      salonId,
      addressId,
      total: parseFloat(totalAmount),
      status: "CONFIRMED", // ✅ Directly to CONFIRMED
      notes: notes || undefined,
      paymentIntentId: paymentIntent.id,
      orderItems: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      orderItems: {
        include: { product: true },
      },
      address: true,
    },
  });

  // ✅ Clear user's cart
  await prisma.cartItem.deleteMany({
    where: { cart: { userId } },
  });

  // ✅ Update inventory
  for (const item of cartItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }

  // ✅ Send notification NOW (after order is created)
  await notificationService.sendOrderConfirmedNotification(order);

  return order;
}
```

### Step 3: Handle Payment Failures

```typescript
async function handlePaymentFailed(paymentIntent) {
  // No order to update - just log the failure
  logger.error("Payment failed", {
    paymentIntentId: paymentIntent.id,
    userId: paymentIntent.metadata.userId,
    amount: paymentIntent.amount,
  });

  // Optional: Send notification to user about failed payment
  await notificationService.sendPaymentFailedNotification({
    userId: paymentIntent.metadata.userId,
    amount: paymentIntent.amount / 100,
  });
}
```

### Step 4: Update Frontend API Calls

**File:** `app/checkout/page.tsx` and `app/api/orders/checkout/route.ts`

Change endpoint from `/api/orders/checkout` to `/api/orders/initialize-payment`:

```typescript
// Frontend: handleInitiateCheckout
const response = await fetch("/api/orders/initialize-payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    addressId: selectedAddressId,
    notes: formData.notes || undefined,
  }),
});

const data = await response.json();

// Note: No orderId in response anymore
setClientSecret(data.data.clientSecret);
setPaymentIntentId(data.data.paymentIntentId);
// orderId will be available after payment succeeds
```

**File:** `app/api/orders/initialize-payment/route.ts` (new)

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://probeauty-backend.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
```

### Step 5: Update Payment Success Page

**File:** `app/payment-success/page.tsx`

Instead of polling for order status, query by paymentIntentId:

```typescript
// Get paymentIntentId from URL
const searchParams = useSearchParams();
const paymentIntentId = searchParams.get("payment_intent");

// Fetch order by paymentIntentId
useEffect(() => {
  async function fetchOrder() {
    const response = await fetch(
      `/api/orders/by-payment-intent/${paymentIntentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setOrder(data.data);
  }

  if (paymentIntentId && token) {
    fetchOrder();
  }
}, [paymentIntentId, token]);
```

## Benefits of This Approach

### ✅ Eliminates Premature Orders

- Orders only exist after successful payment
- No database pollution with unpaid orders
- No need for cleanup jobs

### ✅ Accurate Notifications

- Notifications only sent after payment confirmed
- Users never receive "Order Placed" without paying
- Builds trust and accuracy

### ✅ Simpler Status Flow

```
Before: PENDING → PAYMENT_PENDING → CONFIRMED
After:  (no order) → CONFIRMED
```

### ✅ Better Inventory Management

- Inventory only reduced after payment
- No phantom reservations
- Stock remains available until purchase confirmed

### ✅ Cleaner Database

- Only successful orders in database
- Failed payment attempts don't create records
- Easier reporting and analytics

## Migration Plan

### Phase 1: Backend Changes

1. Create new `/api/v1/payments/initialize` endpoint
2. Update webhook handler to create orders
3. Keep old `/api/v1/orders/checkout` for backward compatibility
4. Add feature flag to switch between flows

### Phase 2: Frontend Updates

1. Update checkout page to use new endpoint
2. Update payment success page to handle new flow
3. Test thoroughly with Stripe test cards

### Phase 3: Cleanup

1. Remove old checkout endpoint
2. Remove PAYMENT_PENDING status (no longer needed)
3. Update documentation

## Testing Checklist

- [ ] Payment succeeds → Order created with CONFIRMED status
- [ ] Payment fails → No order created
- [ ] User abandons payment → No order created
- [ ] Webhook retries work correctly
- [ ] Inventory updated only after payment
- [ ] Cart cleared only after payment
- [ ] Notifications sent only after payment
- [ ] Multiple concurrent payments handled correctly
- [ ] PaymentIntent metadata contains all required data
- [ ] Order contains all correct details from metadata

## Backward Compatibility

During migration, support both flows:

```typescript
// Backend: Check for feature flag
if (req.headers["x-use-new-flow"] === "true") {
  return await initializePayment(req, res);
} else {
  return await createCheckout(req, res); // Old flow
}
```

## Questions?

This is a significant refactor but results in a much cleaner, more reliable system. The key insight is:

> **Orders should be a record of completed purchases, not pending intents.**

Let me know if you need help implementing any part of this!
