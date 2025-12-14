/**
 * Authentication API Client-Side Functions
 * These functions are called from client components and use a Next.js API proxy
 * to avoid CORS issues and keep the backend API URL secure
 */

// Use local Next.js API route as proxy to avoid CORS issues
const API_BASE_URL = "/api/auth";

// Types
export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "salon_owner";
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface AuthResponse {
  message: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

/**
 * Client-side authentication functions
 * These call the API directly from the client
 */

export async function signup(data: SignupData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // TODO: REMOVE - Temporary OTP logging for development
    console.log("🔐 [DEV ONLY] Signup response:", result);
    if (result.otp) {
      console.log("🔐 [DEV ONLY] OTP received:", result.otp);
    }
    // END TODO: REMOVE

    if (!response.ok) {
      // Provide user-friendly error messages
      if (response.status === 409) {
        throw new Error(
          "This email or phone number is already registered. Please use a different one or try logging in."
        );
      }
      throw new Error(result.message || "Signup failed");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred during signup");
  }
}

export async function confirmRegistration(
  email: string,
  otp: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/confirm-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "OTP verification failed");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred during verification");
  }
}

export async function login(data: LoginData): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Provide user-friendly error messages
      if (response.status === 401) {
        throw new Error(
          "Invalid email/phone or password. Please check your credentials and try again."
        );
      }
      if (response.status === 403) {
        throw new Error(
          "Your account is not verified. Please check your email for the verification code."
        );
      }
      throw new Error(result.message || "Login failed");
    }

    // Store tokens in localStorage
    if (result.accessToken) {
      localStorage.setItem("accessToken", result.accessToken);
    }
    if (result.refreshToken) {
      localStorage.setItem("refreshToken", result.refreshToken);
    }
    if (result.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred during login");
  }
}

export async function googleAuth(idToken: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error(
          "Google authentication failed. Please try again or use email/password."
        );
      }
      if (response.status === 503 || response.status === 504) {
        throw new Error(
          "Server is starting up. Please wait 30 seconds and try again."
        );
      }
      throw new Error(result.message || "Google authentication failed");
    }

    // Store tokens and user info
    if (result.accessToken) {
      localStorage.setItem("accessToken", result.accessToken);
    }
    if (result.refreshToken) {
      localStorage.setItem("refreshToken", result.refreshToken);
    }
    if (result.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
    }

    return result;
  } catch (error: any) {
    throw new Error(
      error.message || "An error occurred during Google authentication"
    );
  }
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error("No account found with this email address.");
      }
      if (response.status === 503 || response.status === 504) {
        throw new Error(
          "Server is starting up. Please wait 30 seconds and try again."
        );
      }
      throw new Error(result.message || "Failed to send reset email");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred");
  }
}

export async function verifyResetOTP(
  email: string,
  otp: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-forgot-password-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "OTP verification failed");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred");
  }
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Password reset failed");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred");
  }
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Token refresh failed");
    }

    // Update stored access token
    if (result.accessToken) {
      localStorage.setItem("accessToken", result.accessToken);
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred");
  }
}

export async function resendResetOTP(email: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/resend-forgot-password-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to resend OTP");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred");
  }
}

/**
 * Utility functions for managing authentication state
 */

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function getUser(): any | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

/**
 * Fetch with automatic token refresh
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const { accessToken: newAccessToken } = await refreshAccessToken(
          refreshToken
        );
        // Retry the original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (error) {
        // Refresh failed, logout user
        logout();
        throw new Error("Session expired. Please login again.");
      }
    }
  }

  return response;
}
