import { cn } from "../lib/cn";

interface AmbientGlowProps {
  scrollY?: number;
  className?: string;
}

export function AmbientGlow({ scrollY = 0, className }: AmbientGlowProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl dark:h-[26rem] dark:w-[26rem] dark:bg-brand-500/35 dark:blur-[90px]"
        style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0)` }}
      />
      <div
        className="absolute right-0 top-32 h-80 w-80 rounded-full bg-brand-300/35 blur-3xl dark:bg-brand-300/30 dark:blur-[90px]"
        style={{ transform: `translate3d(0, ${scrollY * -0.12}px, 0)` }}
      />
      <div
        className="absolute bottom-8 left-1/3 h-56 w-56 rounded-full bg-brand-100/70 blur-3xl dark:h-72 dark:w-72 dark:bg-brand-600/30 dark:blur-[80px]"
        style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0)` }}
      />
    </div>
  );
}
