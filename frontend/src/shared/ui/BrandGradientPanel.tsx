import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function BrandGradientPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[28px] text-white shadow-lg", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-[#4c1d95]" />
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
