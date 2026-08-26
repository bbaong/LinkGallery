import { useEffect, type ReactNode } from "react";
import { applyLocale } from "./locale";
import { useLocaleStore } from "./localeStore";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  return children;
}
