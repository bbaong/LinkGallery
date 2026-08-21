import { cn } from "../lib/cn";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "불러오는 중..." }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-soft" role="status">
      <span
        className={cn(
          "h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent",
          className
        )}
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
