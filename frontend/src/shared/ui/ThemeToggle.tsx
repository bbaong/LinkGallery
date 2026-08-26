import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import type { ThemePreference } from "../theme/theme";
import { useThemeStore } from "../theme/themeStore";
import { useT } from "../i18n/useT";

export function ThemeToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const { t } = useT();

  const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("settings.themeLight"), icon: Sun },
    { value: "dark", label: t("settings.themeDark"), icon: Moon },
    { value: "system", label: t("settings.themeSystem"), icon: Monitor },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={t("settings.theme")}
      className={cn("inline-flex rounded-full border border-line bg-surface p-1", className)}
    >
      {options.map((option) => {
        const selected = preference === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => setPreference(option.value)}
            className={cn(
              "inline-flex items-center justify-center rounded-full font-medium transition-colors",
              compact ? "h-8 w-8" : "h-8 gap-1.5 px-3 text-sm",
              selected ? "bg-canvas text-ink shadow-sm" : "text-ink-soft hover:text-ink"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {compact ? null : option.label}
          </button>
        );
      })}
    </div>
  );
}
