import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 disabled:bg-brand-300",
  secondary:
    "bg-surface text-ink border border-line hover:bg-canvas active:bg-canvas disabled:opacity-60",
  ghost: "bg-transparent text-ink-soft hover:bg-black/5 active:bg-black/10 disabled:opacity-50",
  danger: "bg-transparent text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[15px] rounded-full",
  sm: "h-9 px-4 text-sm rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150",
          "disabled:cursor-not-allowed",
          "focus-visible:outline-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
