import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label }: SpinnerProps) {
  const { t } = useT();
  const resolvedLabel = label ?? t("common.loading");
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-soft" role="status">
      <span
        className={cn(
          "h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent",
          className
        )}
        aria-hidden="true"
      />
      <span className="text-sm">{resolvedLabel}</span>
    </div>
  );
}
