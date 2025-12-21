"use client";
import { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "zh-CN", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );
  const [isGoogleTranslateReady, setIsGoogleTranslateReady] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Restore selected language from localStorage on mount
  useEffect(() => {
    const savedLangCode = localStorage.getItem("selectedLanguage");
    if (savedLangCode) {
      const savedLang = languages.find((lang) => lang.code === savedLangCode);
      if (savedLang) {
        setSelectedLanguage(savedLang);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if Google Translate is ready
  useEffect(() => {
    const checkGoogleTranslate = () => {
      const selectElement = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;
      if (selectElement) {
        console.log("✓ Google Translate select element found!");
        setIsGoogleTranslateReady(true);
        return true;
      }
      return false;
    };

    // Listen for custom ready event
    const handleReady = () => {
      console.log("googleTranslateReady event received");
      setTimeout(() => {
        const found = checkGoogleTranslate();
        console.log("After ready event, element found:", found);
      }, 150);
    };

    window.addEventListener("googleTranslateReady", handleReady);

    // Try immediately
    if (checkGoogleTranslate()) {
      window.removeEventListener("googleTranslateReady", handleReady);
      return;
    }

    // Fallback: Poll for Google Translate to be ready (faster interval)
    const interval = setInterval(() => {
      if (checkGoogleTranslate()) {
        clearInterval(interval);
        window.removeEventListener("googleTranslateReady", handleReady);
      }
    }, 100);

    // Clean up after 10 seconds and enable anyway
    const timeout = setTimeout(() => {
      clearInterval(interval);
      window.removeEventListener("googleTranslateReady", handleReady);

      if (!checkGoogleTranslate()) {
        console.warn(
          "Google Translate didn't load in time, but enabling dropdown anyway"
        );
        // Enable the dropdown even if Google Translate isn't ready
        setIsGoogleTranslateReady(true);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("googleTranslateReady", handleReady);
    };
  }, []);

  const changeLanguage = (language: Language) => {
    console.log(`Attempting to change language to: ${language.code}`);
    setSelectedLanguage(language);
    setIsOpen(false);

    // Save to localStorage for persistence
    localStorage.setItem("selectedLanguage", language.code);

    // Function to trigger the translation
    const triggerTranslation = (retryCount = 0): void => {
      const selectElement = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;

      console.log(
        `Retry ${retryCount}: Select element found:`,
        !!selectElement
      );

      if (selectElement) {
        console.log("Current select value:", selectElement.value);
        console.log(
          "Available options:",
          Array.from(selectElement.options).map((o) => o.value)
        );

        // Set the value
        selectElement.value = language.code;
        console.log("New select value:", selectElement.value);

        // Try multiple event types
        selectElement.dispatchEvent(new Event("change", { bubbles: true }));
        selectElement.dispatchEvent(new Event("input", { bubbles: true }));

        // Also try triggering via click
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        selectElement.dispatchEvent(clickEvent);

        console.log(`✓ Language change triggered for: ${language.code}`);
      } else if (retryCount < 30) {
        // Retry up to 30 times (3 seconds total)
        setTimeout(() => triggerTranslation(retryCount + 1), 100);
      } else {
        console.error(
          "Google Translate select element not found after 30 retries."
        );
      }
    };

    triggerTranslation();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group ${
          !isGoogleTranslateReady ? "opacity-50 cursor-wait" : ""
        }`}
        aria-label="Select language"
        disabled={!isGoogleTranslateReady}
        title={
          !isGoogleTranslateReady ? "Loading translator..." : "Select language"
        }
      >
        <Globe className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
        <span className="text-2xl">{selectedLanguage.flag}</span>
        <span className="hidden sm:block text-sm font-medium">
          {selectedLanguage.code.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-linear-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700/50 bg-linear-to-r from-orange-600/20 to-pink-600/20">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Select Language
            </p>
          </div>

          {/* Language List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-150 ${
                  selectedLanguage.code === language.code
                    ? "bg-linear-to-r from-orange-500/30 to-pink-500/30 text-white border-l-4 border-orange-500"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-2xl">{language.flag}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium">{language.name}</span>
                  {selectedLanguage.code === language.code && (
                    <span className="ml-2 text-xs text-orange-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-700/50 bg-gray-900/50">
            <p className="text-xs text-gray-500 text-center">
              Powered by Google Translate
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
