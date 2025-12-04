/**
 * Authentication Helper Functions
 * Handles user authentication state and token management
 */

/**
 * Check if user is authenticated
 * @returns true if user has a valid token
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("authToken");
  return !!token;
}

/**
 * Get the authentication token
 * @returns JWT token or null if not authenticated
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("authToken");
}

/**
 * Set the authentication token
 * @param token - JWT token to store
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("authToken", token);
}

/**
 * Remove the authentication token (logout)
 */
export function removeToken(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("authToken");
}

/**
 * Get user data from token (decode JWT)
 * Note: This is a simple decode, not verification
 * @returns User data from token payload or null
 */
export function getUserFromToken(): any | null {
  const token = getToken();
  if (!token) return null;

  try {
    // JWT has 3 parts: header.payload.signature
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Check if token is expired
 * @returns true if token is expired
 */
export function isTokenExpired(): boolean {
  const user = getUserFromToken();
  if (!user || !user.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return user.exp * 1000 < Date.now();
}

/**
 * Get user ID from token
 * @returns User ID or null
 */
export function getUserId(): string | null {
  const user = getUserFromToken();
  return user?.userId || user?.sub || null;
}

/**
 * Get user role from token
 * @returns User role or null
 */
export function getUserRole(): string | null {
  const user = getUserFromToken();
  return user?.role || null;
}
