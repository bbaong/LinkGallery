import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { APP_NAME } from "../constants/app";
import { cn } from "../lib/cn";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-ink",
        className
      )}
    >
      <Sparkles className="h-5 w-5 text-brand-500" />
      {APP_NAME}
    </Link>
  );
}
