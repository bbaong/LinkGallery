import type { LucideIcon } from "lucide-react";
import { cn } from "../../../shared/lib/cn";

interface TagChipProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export function TagChip({ icon: Icon, label, className }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-500/15 bg-surface px-3.5 py-1.5 text-sm text-ink-soft shadow-[0_1px_2px_rgba(124,58,237,0.06)]",
        "transition-[transform,border-color,box-shadow,color] duration-200",
        "hover:-translate-y-0.5 hover:border-brand-300 hover:text-ink hover:shadow-[0_4px_10px_rgba(124,58,237,0.12)]",
        "dark:border-brand-300/25 dark:bg-[#32313c] dark:shadow-none",
        "dark:hover:border-brand-300 dark:hover:shadow-[0_4px_14px_rgba(139,92,246,0.28)]",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
      {label}
    </span>
  );
}
