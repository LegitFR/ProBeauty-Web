"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type TranslateWindow = Window & {
  googleTranslateElementInit?: () => void;
  setGoogleTranslateLanguage?: (lang: string) => void;
  google?: {
    translate?: {
      TranslateElement?: new (
        options: {
          pageLanguage: string;
          includedLanguages: string;
          autoDisplay: boolean;
        },
        elementId: string,
      ) => void;
    };
  };
};

const STORAGE_KEY = "pb_lang";
const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "fr", "de", "es", "pt"];

function setTranslateCookie(lang: string) {
  const normalized = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  document.cookie = `googtrans=/en/${normalized}; path=/`;
}

function applyLanguageToWidget(lang: string) {
  const normalized = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!select) {
    return;
  }
  select.value = normalized;
  select.dispatchEvent(new Event("change"));
}

export function GoogleTranslateLoader() {
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const storedLang =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG
        : DEFAULT_LANG;

    const targetLang = SUPPORTED_LANGS.includes(storedLang)
      ? storedLang
      : DEFAULT_LANG;

    const translateWindow = window as TranslateWindow;
    translateWindow.googleTranslateElementInit = () => {
      if (translateWindow.google?.translate?.TranslateElement) {
        new translateWindow.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: SUPPORTED_LANGS.join(","),
            autoDisplay: false,
          },
          "google_translate_element",
        );
        setTranslateCookie(targetLang);
        applyLanguageToWidget(targetLang);
      }
    };

    translateWindow.setGoogleTranslateLanguage = (lang: string) => {
      const nextLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
      window.localStorage.setItem(STORAGE_KEY, nextLang);
      setTranslateCookie(nextLang);
      applyLanguageToWidget(nextLang);
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      setTranslateCookie(targetLang);
      applyLanguageToWidget(targetLang);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }
    const translateWindow = window as TranslateWindow;
    const storedLang = window.localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    if (storedLang !== DEFAULT_LANG) {
      setTranslateCookie(storedLang);
      translateWindow.setGoogleTranslateLanguage?.(storedLang);
    }
  }, [pathname]);

  return <div id="google_translate_element" aria-hidden="true" />;
}
