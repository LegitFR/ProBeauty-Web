/**
 * Centralized authentication error handler
 * Handles JWT expiration with automatic token refresh
 */

import { logout, getRefreshToken, refreshAccessToken } from "@/lib/api/auth";

export interface AuthError {
  success?: boolean;
  message?: string;
  error?: string;
}

// Track if a refresh is in progress to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

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
    lowerError.includes("access token has expired") ||
    lowerError.includes("access token expired") ||
    lowerError.includes("access_token_expired") ||
    lowerError.includes("unauthorized") ||
    lowerError.includes("session expired")
  );
}

/**
 * Attempt to refresh the access token using the refresh token
 * Returns the new access token or null if refresh fails
 */
export async function attemptTokenRefresh(): Promise<string | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log("[Auth] No refresh token available");
        return null;
      }

      console.log("[Auth] Attempting to refresh access token...");
      const result = await refreshAccessToken(refreshToken);

      if (result.accessToken) {
        console.log("[Auth] Successfully refreshed access token");
        return result.accessToken;
      }

      return null;
    } catch (error) {
      console.error("[Auth] Token refresh failed:", error);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Handle authentication errors - tries to refresh token first, then logs out if that fails
 */
export async function handleAuthError(error?: any): Promise<boolean> {
  console.log("[Auth Error Handler] Detected expired or invalid token");

  // Try to refresh the token first
  const newToken = await attemptTokenRefresh();

  if (newToken) {
    console.log("[Auth] Token refreshed successfully, continuing...");
    return true; // Token refreshed successfully
  }

  // If refresh failed, logout user
  console.log("[Auth] Token refresh failed, logging out user");
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

  return false; // Token refresh failed
}

/**
 * @deprecated Use fetchWithAuth instead - automatic token refresh is now handled by the fetch wrapper
 */
export async function checkAndHandleAuthError(
  response: Response,
  data?: any,
): Promise<boolean> {
  console.warn(
    "checkAndHandleAuthError is deprecated. Use fetchWithAuth instead.",
  );

  // Check status code
  if (response.status === 401) {
    if (data && isAuthExpired(data)) {
      return await handleAuthError(data);
    }
  }

  return false;
}
