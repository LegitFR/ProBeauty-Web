"use client";

import { useEffect, useRef } from "react";
import { getAccessToken, logout } from "@/lib/api/auth";

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

  useEffect(() => {
    const handleExpiredSession = () => {
      if (handledRef.current) {
        return;
      }

      handledRef.current = true;
      logout();
      window.dispatchEvent(new Event("auth-expired"));
    };

    const checkTokenExpiry = () => {
      const token = getAccessToken();
      if (!token) {
        handledRef.current = false;
        return;
      }

      if (isJwtExpired(token)) {
        handleExpiredSession();
      }
    };

    checkTokenExpiry();

    const intervalId = window.setInterval(checkTokenExpiry, 30000);
    window.addEventListener("focus", checkTokenExpiry);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkTokenExpiry);
    };
  }, []);

  return null;
}
