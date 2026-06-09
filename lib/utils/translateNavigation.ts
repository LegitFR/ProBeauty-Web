const STORAGE_KEY = "pb_lang";
const DEFAULT_LANG = "en";
const TRANSLATE_LANGS = ["fr", "de", "es"];

type RouterLike = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

export function shouldForceTranslateReload(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storedLang = window.localStorage.getItem(STORAGE_KEY);
  return !!storedLang && TRANSLATE_LANGS.includes(storedLang);
}

export function navigateWithTranslate(
  router: RouterLike,
  href: string,
  options?: { replace?: boolean },
) {
  if (shouldForceTranslateReload()) {
    window.location.href = href;
    return;
  }

  if (options?.replace) {
    router.replace(href);
    return;
  }

  router.push(href);
}
