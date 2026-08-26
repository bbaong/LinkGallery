import { create } from "zustand";
import { applyLocale, LOCALE_STORAGE_KEY, readLocale, type Locale } from "./locale";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: typeof window === "undefined" ? "ko" : readLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    applyLocale(locale);
    set({ locale });
  },
}));
