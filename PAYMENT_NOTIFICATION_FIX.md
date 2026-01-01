# Payment Notification Issue - Fix Guide

## Problem

Orders are being created with `PAYMENT_PENDING` status before payment is completed. When users navigate away from the checkout page without paying, they still receive notifications that "Order has been placed."

## Root Cause

The backend is sending order notifications immediately when the order is created (status: `PAYMENT_PENDING`), instead of waiting for payment confirmation via webhook (status: `CONFIRMED`).

## Current Flow

```
1. User clicks "Proceed to Payment"
2. Backend creates Order with PAYMENT_PENDING status  ❌ Notification sent here
3. Backend creates Stripe PaymentIntent
4. User sees payment form
5. User navigates away without paying
6. Order still exists with PAYMENT_PENDING status
7. User received notification but never paid
```

## Correct Flow

```
1. User clicks "Proceed to Payment"
2. Backend creates Order with PAYMENT_PENDING status  ⚠️ NO notification yet
3. Backend creates Stripe PaymentIntent
4. User sees payment form
5. User completes payment
6. Stripe sends payment_intent.succeeded webhook
7. Backend updates Order status to CONFIRMED  ✅ Notification sent here
8. User receives notification - payment confirmed
```

## Solution

### Backend Changes Required (CRITICAL)

The backend team needs to modify the notification logic:

**File:** `backend/src/services/orderService.ts` (or equivalent)

**Current (Incorrect):**

```typescript
// In createOrder function
async function createOrder(data) {
  const order = await db.order.create({ ... });

  // ❌ WRONG: Sending notification immediately
  await notificationService.sendOrderCreatedNotification(order);

  return order;
}
```

**Fixed (Correct):**

```typescript
// In createOrder function
async function createOrder(data) {
  const order = await db.order.create({ ... });

  // ✅ CORRECT: Do NOT send notification here for PAYMENT_PENDING orders
  // Notification will be sent by webhook handler when payment succeeds

  return order;
}

// In webhook handler
async function handlePaymentSucceeded(paymentIntent) {
  const order = await db.order.update({
    where: { paymentIntentId: paymentIntent.id },
    data: { status: 'CONFIRMED' }
  });

  // ✅ CORRECT: Send notification ONLY after payment is confirmed
  await notificationService.sendOrderConfirmedNotification(order);
}
```

### Notification Logic Rules

**DO send notifications for:**

- ✅ `CONFIRMED` - Payment succeeded via webhook
- ✅ `SHIPPED` - Order dispatched
- ✅ `DELIVERED` - Order delivered
- ✅ `PAYMENT_FAILED` - Payment failed (to inform user to retry)
- ✅ `CANCELLED` - Order cancelled

**DO NOT send notifications for:**

- ❌ `PENDING` - Initial order creation
- ❌ `PAYMENT_PENDING` - Payment not yet completed

### Frontend Improvements (Completed)

Added to checkout page:

1. Clear messaging that order is being prepared for payment
2. Warning icon showing payment required
3. Automatic cleanup of abandoned orders (backend should implement)

### Database Cleanup (Backend Recommendation)

Add a scheduled job to clean up abandoned orders:

```typescript
// Run daily
async function cleanupAbandonedOrders() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await db.order.deleteMany({
    where: {
      status: "PAYMENT_PENDING",
      createdAt: { lt: oneDayAgo },
    },
  });
}
```

## Testing Checklist

### Backend Team

- [ ] Verify notifications are NOT sent when order is created with PAYMENT_PENDING
- [ ] Verify notifications ARE sent when webhook confirms payment (CONFIRMED)
- [ ] Verify abandoned orders are cleaned up after 24 hours
- [ ] Test webhook handler updates order status correctly
- [ ] Test notification is sent after status becomes CONFIRMED

### Frontend Team

- [ ] Create test order and navigate away before paying
- [ ] Verify NO notification is received
- [ ] Complete payment flow and verify notification IS received
- [ ] Check order status polling works correctly

## Communication

**Message to Backend Team:**

> Hi team,
>
> We're getting reports of users receiving "Order Placed" notifications even when they haven't completed payment. This happens when users navigate away from the checkout page before entering payment details.
>
> **Root Cause:** Order notifications are being sent immediately when orders are created with `PAYMENT_PENDING` status, rather than waiting for payment confirmation via Stripe webhook.
>
> **Required Fix:**
>
> 1. Remove notification sending from `createOrder` function for orders with `PAYMENT_PENDING` status
> 2. Move notification sending to the Stripe webhook handler (`payment_intent.succeeded`)
> 3. Only send "Order Placed/Confirmed" notification when order status becomes `CONFIRMED`
>
> **Optional Improvements:**
>
> - Add scheduled job to clean up orders older than 24 hours with `PAYMENT_PENDING` status
> - Add notification for `PAYMENT_FAILED` status to inform users to retry
>
> Please see PAYMENT_NOTIFICATION_FIX.md for detailed implementation guidance.
>
> Thanks!

## Expected Outcome

After fix:

- ✅ Users only receive notifications AFTER successful payment
- ✅ Abandoned orders don't trigger notifications
- ✅ System is more reliable and user-friendly
- ✅ No confusion about order status

## References

- [ORDER_INTEGRATION.md](ORDER_INTEGRATION.md) - Current payment flow
- [STRIPE_SETUP.md](STRIPE_SETUP.md) - Stripe configuration
- Backend webhook endpoint: `/api/v1/webhooks/stripe`
- Stripe event: `payment_intent.succeeded`
