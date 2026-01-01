/**
 * Stripe Configuration
 * Initialize Stripe with publishable key
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";

// Get Stripe publishable key from environment
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe payments will not work."
  );
}

// Initialize Stripe - this is a promise that resolves to the Stripe instance
export const stripePromise: Promise<Stripe | null> = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);
