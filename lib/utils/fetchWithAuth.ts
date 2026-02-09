/**
 * Authenticated Fetch Wrapper with Automatic Token Refresh
 * Automatically refreshes access token when it expires
 */

import {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
} from "@/lib/api/auth";
import { isAuthExpired, handleAuthError } from "./authErrorHandler";

// Track if a refresh is in progress to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token
 */
async function attemptTokenRefresh(): Promise<string | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log("[Fetch Auth] No refresh token available");
        return null;
      }

      console.log("[Fetch Auth] Attempting to refresh access token...");
      const result = await refreshAccessToken(refreshToken);

      if (result.accessToken) {
        console.log("[Fetch Auth] Successfully refreshed access token");
        return result.accessToken;
      }

      return null;
    } catch (error) {
      console.error("[Fetch Auth] Token refresh failed:", error);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Fetch with automatic authentication and token refresh
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retryCount - Internal counter to prevent infinite retry loops
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<Response> {
  const MAX_RETRIES = 1; // Only retry once

  // Get current access token
  let accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If request succeeds or it's not an auth error, return the response
  if (response.ok || response.status !== 401) {
    return response;
  }

  // If we get a 401, check if it's a token expiration
  const responseText = await response.text();

  if (!isAuthExpired(responseText) || retryCount >= MAX_RETRIES) {
    // Not an auth error or max retries reached, return the failed response
    return new Response(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  // Try to refresh the token
  console.log("[Fetch Auth] Access token expired, attempting refresh...");
  const newAccessToken = await attemptTokenRefresh();

  if (!newAccessToken) {
    // Token refresh failed, handle auth error (logout user)
    await handleAuthError(responseText);
    throw new Error("Session expired. Please log in again.");
  }

  // Retry the original request with the new token
  console.log("[Fetch Auth] Retrying request with new access token...");
  return fetchWithAuth(url, options, retryCount + 1);
}

/**
 * Helper to make authenticated GET requests with JSON response
 */
export async function fetchJsonWithAuth<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage =
        errorData.message ||
        errorData.error ||
        `Request failed: ${response.status}`;
    } catch {
      errorMessage = errorText || `Request failed: ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
