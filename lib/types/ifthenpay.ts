/**
 * If-Then Pay Payment Types
 * Types for the If-Then Pay payment integration
 */

export type PaymentMethod = "STRIPE" | "CCARD" | "MBWAY" | "ONSPOT";

export type PaymentProvider = "stripe" | "ifthenpay";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "cancelled";

/**
 * Base payment response from backend
 */
export interface BasePaymentResponse {
  provider: PaymentProvider;
  method: string;
  reference: string;
  requestId: string;
  status: PaymentStatus;
}

/**
 * CCARD payment response
 */
export interface CCARDPaymentResponse extends BasePaymentResponse {
  method: "CCARD";
  paymentUrl: string;
}

/**
 * MB WAY payment response
 */
export interface MBWayPaymentResponse extends BasePaymentResponse {
  method: "MBWAY";
  mobileNumber: string;
  message: string;
}

/**
 * Stripe payment response
 */
export interface StripePaymentResponse {
  provider: "stripe";
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Union type for all payment responses
 */
export type PaymentResponse =
  | CCARDPaymentResponse
  | MBWayPaymentResponse
  | StripePaymentResponse;

/**
 * Order checkout response
 */
export interface OrderCheckoutResponse {
  message: string;
  data: {
    order: {
      id: string;
      status: string;
    };
    payment?: PaymentResponse;
    clientSecret?: string; // For Stripe compatibility
    paymentIntentId?: string; // For Stripe compatibility
  };
}

/**
 * Booking checkout response
 */
export interface BookingCheckoutResponse {
  message: string;
  data: {
    booking: {
      id: string;
      status: string;
    };
    payment?: PaymentResponse;
    clientSecret?: string; // For Stripe compatibility
    paymentIntentId?: string; // For Stripe compatibility
  };
}

/**
 * Order checkout request
 */
export interface OrderCheckoutRequest {
  addressId: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  mobileNumber?: string; // Required for MBWAY
}

/**
 * Booking checkout request
 */
export interface BookingCheckoutRequest {
  salonId: string;
  serviceIds: string[];
  staffId: string;
  startTime: string;
  paymentMethod?: PaymentMethod;
  mobileNumber?: string; // Required for MBWAY
}

/**
 * Payment details response
 */
export interface PaymentDetailsResponse {
  id: string;
  orderId?: string;
  bookingId?: string;
  provider: PaymentProvider;
  method: string;
  amount: number;
  status: PaymentStatus;
  txnId: string;
  ifthenpayRequestId?: string;
  ifthenpayMethod?: "CCARD" | "MBWAY";
  ifthenpayPaymentUrl?: string;
  metadata?: {
    mobileNumber?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Type guard for CCARD payment
 */
export function isCCARDPayment(
  payment: PaymentResponse
): payment is CCARDPaymentResponse {
  return (
    payment.provider === "ifthenpay" &&
    "method" in payment &&
    payment.method === "CCARD"
  );
}

/**
 * Type guard for MB WAY payment
 */
export function isMBWayPayment(
  payment: PaymentResponse
): payment is MBWayPaymentResponse {
  return (
    payment.provider === "ifthenpay" &&
    "method" in payment &&
    payment.method === "MBWAY"
  );
}

/**
 * Type guard for Stripe payment
 */
export function isStripePayment(
  payment: PaymentResponse
): payment is StripePaymentResponse {
  return payment.provider === "stripe";
}
