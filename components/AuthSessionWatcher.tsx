"use client";

import { useEffect, useRef } from "react";
import {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  logout,
} from "@/lib/api/auth";

function isJwtExpired(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return false;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    if (!payload?.exp) {
      return false;
    }

    const expirationMs = Number(payload.exp) * 1000;
    return Number.isFinite(expirationMs) && Date.now() >= expirationMs;
  } catch {
    return false;
  }
}

export function AuthSessionWatcher() {
  const handledRef = useRef(false);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const handleExpiredSession = () => {
      if (handledRef.current) {
        return;
      }

      handledRef.current = true;
      logout();
      window.dispatchEvent(new Event("auth-expired"));
    };

    const checkTokenExpiry = async () => {
      const token = getAccessToken();
      if (!token) {
        handledRef.current = false;
        return;
      }

      if (isJwtExpired(token)) {
        if (refreshingRef.current) {
          return;
        }

        refreshingRef.current = true;
        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            handleExpiredSession();
            return;
          }

          await refreshAccessToken(refreshToken);
          handledRef.current = false;
        } catch {
          handleExpiredSession();
        } finally {
          refreshingRef.current = false;
        }
      }
    };

    void checkTokenExpiry();

    const intervalId = window.setInterval(() => {
      void checkTokenExpiry();
    }, 30000);
    const onFocus = () => {
      void checkTokenExpiry();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
