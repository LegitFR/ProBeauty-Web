"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { NotificationProvider } from "@/components/NotificationContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </GoogleOAuthProvider>
  );
}
