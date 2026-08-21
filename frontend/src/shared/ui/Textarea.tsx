import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full resize-none rounded-2xl border bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/70",
          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          hasError ? "border-red-400" : "border-line",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
