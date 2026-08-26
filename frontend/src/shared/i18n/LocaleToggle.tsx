import { useT } from "./useT";
import type { Locale } from "./locale";
import { cn } from "../lib/cn";

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useT();
  const next: Locale = locale === "ko" ? "en" : "ko";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      title={t("settings.language")}
      aria-label={t("settings.language")}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-line bg-surface px-2.5 text-xs font-semibold text-ink",
        className
      )}
    >
      {locale === "ko" ? "EN" : "한"}
    </button>
  );
}
