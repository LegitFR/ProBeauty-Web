/**
 * Custom hooks for common notification operations
 */

import { useNotifications } from "@/components/NotificationContext";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Notification } from "@/lib/types/notification";

/**
 * Hook for handling notification navigation
 * Automatically marks notification as read and navigates to appropriate screen
 */
export function useNotificationNavigation() {
  const { markAsRead } = useNotifications();
  const router = useRouter();

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Mark as read if unread
      if (!notification.isRead) {
        try {
          await markAsRead(notification.id);
        } catch (error) {
          console.error("Failed to mark notification as read:", error);
        }
      }

      // Navigate based on notification type and data
      if (notification.data?.screen) {
        switch (notification.data.screen) {
          case "BookingDetails":
            if (notification.data.bookingId) {
              router.push(
                `/profile?tab=bookings&id=${notification.data.bookingId}`
              );
            }
            break;

          case "OrderDetails":
            if (notification.data.orderId) {
              router.push(
                `/profile?tab=orders&id=${notification.data.orderId}`
              );
            }
            break;

          case "Promotions":
            if (notification.data.promoId) {
              router.push(`/promotions/${notification.data.promoId}`);
            } else {
              router.push("/promotions");
            }
            break;

          default:
            console.warn(
              "Unknown notification screen:",
              notification.data.screen
            );
        }
      }
    },
    [markAsRead, router]
  );

  return { handleNotificationClick };
}

/**
 * Hook for filtering notifications by type
 */
export function useNotificationFilter() {
  const { notifications } = useNotifications();

  const filterByType = useCallback(
    (type: Notification["type"]) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  const getUnreadByType = useCallback(
    (type: Notification["type"]) => {
      return notifications.filter((n) => n.type === type && !n.isRead);
    },
    [notifications]
  );

  return {
    bookingNotifications: filterByType("booking"),
    orderNotifications: filterByType("order"),
    promotionNotifications: filterByType("promotion"),
    unreadBookings: getUnreadByType("booking"),
    unreadOrders: getUnreadByType("order"),
    unreadPromotions: getUnreadByType("promotion"),
  };
}

/**
 * Hook for batch notification operations
 */
export function useNotificationBatch() {
  const { markAsRead, deleteNotif, notifications } = useNotifications();

  const markMultipleAsRead = useCallback(
    async (notificationIds: string[]) => {
      const promises = notificationIds.map((id) => markAsRead(id));
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error("Failed to mark multiple notifications as read:", error);
        throw error;
      }
    },
    [markAsRead]
  );

  const deleteMultiple = useCallback(
    async (notificationIds: string[]) => {
      const promises = notificationIds.map((id) => deleteNotif(id));
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error("Failed to delete multiple notifications:", error);
        throw error;
      }
    },
    [deleteNotif]
  );

  const markTypeAsRead = useCallback(
    async (type: Notification["type"]) => {
      const typeNotifications = notifications.filter(
        (n) => n.type === type && !n.isRead
      );
      const ids = typeNotifications.map((n) => n.id);
      await markMultipleAsRead(ids);
    },
    [notifications, markMultipleAsRead]
  );

  const deleteByType = useCallback(
    async (type: Notification["type"]) => {
      const typeNotifications = notifications.filter((n) => n.type === type);
      const ids = typeNotifications.map((n) => n.id);
      await deleteMultiple(ids);
    },
    [notifications, deleteMultiple]
  );

  return {
    markMultipleAsRead,
    deleteMultiple,
    markTypeAsRead,
    deleteByType,
  };
}
