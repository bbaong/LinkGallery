import { create } from "zustand";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme";

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const preference = typeof window === "undefined" ? "system" : readThemePreference();
  return {
    preference,
    resolved: typeof window === "undefined" ? "light" : resolveTheme(preference),
    setPreference: (next) => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      set({ preference: next, resolved: applyTheme(next) });
    },
  };
});
