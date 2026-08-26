import { useEffect, type ReactNode } from "react";
import { applyTheme } from "./theme";
import { useThemeStore } from "./themeStore";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useThemeStore((state) => state.preference);

  useEffect(() => {
    const resolved = applyTheme(preference);
    useThemeStore.setState({ resolved });
  }, [preference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      if (useThemeStore.getState().preference !== "system") return;
      useThemeStore.setState({ resolved: applyTheme("system") });
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return children;
}
