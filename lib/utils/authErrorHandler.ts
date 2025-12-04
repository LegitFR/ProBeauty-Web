/**
 * Centralized authentication error handler
 * Handles JWT expiration and forces logout with redirect to login
 */

import { logout } from "@/lib/api/auth";

export interface AuthError {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Check if an error response indicates JWT expiration or invalid token
 */
export function isAuthExpired(error: any): boolean {
  if (!error) return false;

  const errorStr = typeof error === "string" ? error : JSON.stringify(error);
  const lowerError = errorStr.toLowerCase();

  return (
    lowerError.includes("jwt expired") ||
    lowerError.includes("invalid token") ||
    lowerError.includes("token expired") ||
    lowerError.includes("unauthorized") ||
    lowerError.includes("session expired")
  );
}

/**
 * Handle authentication errors - logs out user and shows login modal
 */
export function handleAuthError(error?: any): void {
  console.log("[Auth Error Handler] Detected expired or invalid token");

  // Logout user (clear localStorage)
  logout();

  // Store current path for redirect after login
  const currentPath = window.location.pathname;
  if (currentPath !== "/" && currentPath !== "/login") {
    localStorage.setItem("redirectAfterLogin", currentPath);
  }

  // Dispatch custom event to notify all components
  // This will trigger login modal in Header and clear cart in CartContext
  window.dispatchEvent(new Event("auth-expired"));

  // Dynamic import toast to avoid SSR issues
  if (typeof window !== "undefined") {
    import("sonner").then(({ toast }) => {
      toast.error("Your session has expired. Please log in again.", {
        duration: 5000,
      });
    });
  }
}

/**
 * Parse error response and check for auth errors
 */
export function checkAndHandleAuthError(
  response: Response,
  data?: any
): boolean {
  // Check status code
  if (response.status === 401) {
    if (data && isAuthExpired(data)) {
      handleAuthError(data);
      return true;
    }
  }

  return false;
}
