"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const LanguageSwitcher = dynamic(
  () =>
    import("./LanguageSwitcher").then((mod) => ({
      default: mod.LanguageSwitcher,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-[140px] h-10 bg-gray-100 animate-pulse rounded" />
    ),
  }
);

export function LanguageSwitcherWrapper() {
  return (
    <Suspense
      fallback={
        <div className="w-[140px] h-10 bg-gray-100 animate-pulse rounded" />
      }
    >
      <LanguageSwitcher />
    </Suspense>
  );
}
