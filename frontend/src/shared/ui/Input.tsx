import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink placeholder:text-ink-soft/70",
          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          hasError ? "border-red-400" : "border-line",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
