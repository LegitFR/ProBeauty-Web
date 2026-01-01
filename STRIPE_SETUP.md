# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for the Pro Beauty e-commerce platform.

## Prerequisites

- Node.js 18+ installed
- Stripe account (sign up at https://stripe.com)
- Access to the backend repository with Stripe webhook configuration

## Frontend Setup

### 1. Install Dependencies

Already completed:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Configure Environment Variables

Create or update `.env.local` file:

```env
# Stripe Publishable Key (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend API URL
BACKEND_URL=https://probeauty-backend.onrender.com
```

**Getting your Stripe keys:**

1. Go to https://dashboard.stripe.com/apikeys
2. Copy the "Publishable key" (starts with `pk_test_`)
3. Paste it in your `.env.local` file

### 3. Test the Integration

#### Development Testing

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Use Stripe test cards:**

   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC (e.g., 123)

3. **Test the checkout flow:**
   - Add products to cart
   - Go to checkout
   - Select/add address
   - Click "Proceed to Payment"
   - Fill in Stripe payment form with test card
   - Click "Pay Now"
   - Should redirect to success page with order polling

## Backend Setup (Required)

The backend must have Stripe configured to process payments and webhooks.

### Required Backend Environment Variables

```env
# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Webhook Secret (for verifying webhook signatures)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Webhook Configuration

1. **Register webhook endpoint in Stripe Dashboard:**

   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://probeauty-backend.onrender.com/api/v1/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `payment_intent.processing`
     - `charge.refunded`

2. **Copy webhook signing secret:**
   - After creating the endpoint, copy the signing secret
   - Add it to backend `.env` as `STRIPE_WEBHOOK_SECRET`

### Local Webhook Testing with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe

# Copy the webhook signing secret shown and add to backend .env
```

## File Structure

```
pro-beauty-web/
├── app/
│   ├── checkout/
│   │   └── page.tsx                    # Main checkout page with Stripe integration
│   ├── payment-success/
│   │   └── page.tsx                    # Success page with order polling
│   └── api/
│       └── orders/
│           ├── route.ts                # Orders API proxy
│           └── checkout/
│               └── route.ts            # Checkout session API proxy
├── components/
│   └── StripePaymentForm.tsx           # Stripe Elements payment form
├── lib/
│   ├── stripe/
│   │   └── config.ts                   # Stripe initialization
│   ├── hooks/
│   │   └── useOrderStatus.ts           # Order status polling hook
│   └── api/
│       └── order.ts                    # Order API client functions
└── .env.local                          # Environment variables (create this)
```

## Features Implemented

### ✅ Stripe Payment Elements

- Secure card payment form
- Supports all major card brands
- 3D Secure authentication
- Real-time validation

### ✅ Order Status Polling

- Automatically polls backend for payment confirmation
- Shows loading state while waiting for webhook
- Updates UI when payment is confirmed
- Handles payment failures gracefully

### ✅ Webhook-Driven Confirmation

- Payment confirmed asynchronously via webhooks
- Prevents race conditions
- Idempotent webhook processing
- Secure signature verification

### ✅ VAT Removed

- Prices shown are final product prices
- No additional tax calculation
- Simplified pricing display

### ✅ Error Handling

- User-friendly error messages
- Network error handling
- Payment failure handling
- Timeout handling (60 seconds)

## Payment Flow Testing Checklist

- [ ] User can add items to cart
- [ ] User can select/add delivery address
- [ ] User can add optional delivery notes
- [ ] "Proceed to Payment" button creates checkout session
- [ ] Stripe payment form appears with clientSecret
- [ ] Test card (4242...) processes successfully
- [ ] User redirected to success page
- [ ] Success page shows "Confirming payment..." loading state
- [ ] After webhook, order status updates to CONFIRMED
- [ ] Success message and order details displayed
- [ ] Cart is cleared after successful order

## Troubleshooting

### "Stripe has not loaded yet"

- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify the key starts with `pk_test_` or `pk_live_`
- Restart the development server after adding env variable

### "Payment stuck in pending"

- Check backend logs for webhook errors
- Verify webhook endpoint is registered in Stripe Dashboard
- Ensure `STRIPE_WEBHOOK_SECRET` is set on backend
- Use Stripe CLI for local testing

### "clientSecret is null"

- Check browser console for checkout API errors
- Verify user is authenticated (token in localStorage)
- Verify address is selected
- Check backend /api/v1/orders/checkout endpoint is working

### "Order status not updating"

- Check that webhook is configured and firing
- Verify backend is receiving webhooks (check logs)
- Ensure polling is working (check browser network tab)
- Check that orderId is passed in URL parameter

## Security Considerations

✅ **Implemented:**

- Payment data never touches our servers (PCI compliance)
- Stripe.js handles all sensitive card data
- Webhook signature verification on backend
- Bearer token authentication for all API calls
- HTTPS required in production

## Production Checklist

Before going live:

- [ ] Switch to Stripe live mode keys (`pk_live_` and `sk_live_`)
- [ ] Update webhook endpoint URL to production backend
- [ ] Use production webhook signing secret
- [ ] Test with real payment methods
- [ ] Enable webhook monitoring in Stripe Dashboard
- [ ] Set up error alerting
- [ ] Configure proper logging
- [ ] Test refund flow
- [ ] Document payment policies

## Support & Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe API Reference:** https://stripe.com/docs/api
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe CLI:** https://stripe.com/docs/stripe-cli

## Next Steps

1. Get Stripe publishable key and add to `.env.local`
2. Ensure backend has Stripe secret key configured
3. Register webhook endpoint in Stripe Dashboard
4. Test the payment flow with test cards
5. Monitor webhook events in Stripe Dashboard
6. Test order status updates
7. Verify cart clearing works
8. Test error scenarios

---

**Integration Complete! 🎉**

The Stripe payment system is now fully integrated and ready for testing.
