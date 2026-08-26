export const LOCALE_STORAGE_KEY = "link-gallery-locale";

export type Locale = "ko" | "en";

export function isLocale(value: unknown): value is Locale {
  return value === "ko" || value === "en";
}

export function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "ko";
}

export function applyLocale(locale: Locale) {
  document.documentElement.lang = locale === "en" ? "en" : "ko";
  return locale;
}
