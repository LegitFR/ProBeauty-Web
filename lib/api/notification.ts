/**
 * Notification API Client Functions
 * Handles push notifications and in-app notifications
 */

import {
  RegisterTokenRequest,
  RegisterTokenResponse,
  GetNotificationsParams,
  GetNotificationsResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  ClearAllNotificationsResponse,
  ApiErrorResponse,
} from "@/lib/types/notification";
import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = "/api/notifications";

/**
 * Register or update a device token for push notifications
 */
export async function registerDeviceToken(
  token: string,
  data: RegisterTokenRequest,
): Promise<RegisterTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/register-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || "Failed to register device token");
  }

  return response.json();
}

/**
 * Fetch user's notifications with pagination
 */
export async function getNotifications(
  token: string,
  params?: GetNotificationsParams,
): Promise<GetNotificationsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  if (params?.unreadOnly !== undefined) {
    queryParams.append("unreadOnly", params.unreadOnly.toString());
  }

  const url = `${API_BASE_URL}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
    });

    const data = await response.json();

    // If response is not ok but has notifications structure, return it anyway
    // This handles graceful degradation when backend has issues
    if (!response.ok) {
      if (data.notifications && Array.isArray(data.notifications)) {
        return data;
      }
      throw new Error(data.message || "Failed to fetch notifications");
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    // Return empty notifications instead of throwing to prevent UI crashes
    return {
      notifications: [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(
  token: string,
  notificationId: string,
): Promise<MarkAsReadResponse> {
  const response = await fetch(`${API_BASE_URL}/${notificationId}/read`, {
    method: "PUT",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || "Failed to mark notification as read");
  }

  return response.json();
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(
  token: string,
): Promise<MarkAllAsReadResponse> {
  const response = await fetch(`${API_BASE_URL}/read-all`, {
    method: "PUT",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(
      error.message || "Failed to mark all notifications as read",
    );
  }

  return response.json();
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  token: string,
  notificationId: string,
): Promise<DeleteNotificationResponse> {
  const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || "Failed to delete notification");
  }

  return response.json();
}

/**
 * Clear all notifications (permanently delete all)
 */
export async function clearAllNotifications(
  token: string,
): Promise<ClearAllNotificationsResponse> {
  const response = await fetch(`${API_BASE_URL}/clear-all`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error(error.message || "Failed to clear all notifications");
  }

  return response.json();
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount(token: string): Promise<number> {
  try {
    const response = await getNotifications(token, {
      page: 1,
      limit: 1,
      unreadOnly: true,
    });
    return response.pagination.total;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return 0;
  }
}
