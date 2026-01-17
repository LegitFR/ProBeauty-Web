// Notification Types

export type NotificationType = "booking" | "order" | "promotion";

export type Platform = "ios" | "android" | "web";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  data?: NotificationData;
}

export interface NotificationData {
  bookingId?: string;
  orderId?: string;
  promoId?: string;
  action?: string;
  screen?: string;
  status?: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  fcmToken: string;
  platform: Platform;
  isActive: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface RegisterTokenRequest {
  token: string;
  platform: Platform;
}

export interface RegisterTokenResponse {
  message: string;
  deviceToken: DeviceToken;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MarkAsReadResponse {
  message: string;
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  message: string;
  updatedCount: number;
}

export interface DeleteNotificationResponse {
  message: string;
}

export interface ClearAllNotificationsResponse {
  message: string;
  deletedCount: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  stack?: string;
}
