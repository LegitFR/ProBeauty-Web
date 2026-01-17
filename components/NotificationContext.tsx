"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Notification,
  GetNotificationsParams,
  Platform,
} from "@/lib/types/notification";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  registerDeviceToken,
  getUnreadCount,
} from "@/lib/api/notification";
import { isAuthenticated, getToken } from "@/lib/auth";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  // Actions
  fetchNotifications: (params?: GetNotificationsParams) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotif: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  registerDevice: (token: string, platform: Platform) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  // Check authentication status
  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuth) return;

    const token = getToken();
    if (!token) return;

    try {
      const count = await getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isAuth]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (params?: GetNotificationsParams) => {
      if (!isAuth) return;

      const token = getToken();
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await getNotifications(token, {
          page: params?.page || 1,
          limit: params?.limit || 20,
          unreadOnly: params?.unreadOnly,
        });

        if (params?.page === 1 || !params?.page) {
          setNotifications(response.notifications);
        } else {
          setNotifications((prev) => [...prev, ...response.notifications]);
        }

        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setHasMore(response.pagination.page < response.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuth],
  );

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchNotifications({ page: currentPage + 1 });
  }, [hasMore, isLoading, currentPage, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await markNotificationAsRead(token, notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      await markAllNotificationsAsRead(token);

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }, []);

  // Delete notification
  const deleteNotif = useCallback(
    async (notificationId: string) => {
      const token = getToken();
      if (!token) return;

      try {
        await deleteNotification(token, notificationId);

        const deletedNotif = notifications.find((n) => n.id === notificationId);

        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId),
        );

        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
        throw error;
      }
    },
    [notifications],
  );

  // Clear all notifications
  const clearAll = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      await clearAllNotifications(token);

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      throw error;
    }
  }, []);

  // Register device token
  const registerDevice = useCallback(
    async (token: string, platform: Platform) => {
      if (!isAuth) return;

      const authToken = getToken();
      if (!authToken) return;

      try {
        const result = await registerDeviceToken(authToken, {
          token,
          platform,
        });

        // 🔍 DEBUG: Log device token (REMOVE AFTER VERIFICATION)
        console.log("✅ Device Token Registered:", result);
        // 🔍 END DEBUG
      } catch (error) {
        console.error("Failed to register device token:", error);
        throw error;
      }
    },
    [isAuth],
  );

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuth) {
      fetchNotifications({ page: 1 });
      refreshUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuth) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuth, refreshUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    currentPage,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotif,
    clearAll,
    registerDevice,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
