import { useEffect, useState } from "react";

const STORAGE_KEY = "pb_lang";
const DEFAULT_LANG = "en";

export function useLanguage(): string {
  const [language, setLanguage] = useState<string>(DEFAULT_LANG);

  useEffect(() => {
    const updateLanguage = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setLanguage(stored || DEFAULT_LANG);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setLanguage(event.newValue || DEFAULT_LANG);
      }
    };

    updateLanguage();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pb-lang-change", updateLanguage as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "pb-lang-change",
        updateLanguage as EventListener,
      );
    };
  }, []);

  return language;
}
