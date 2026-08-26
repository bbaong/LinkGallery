import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import type { RecentLink } from "../types";
import { useVisitLinkMutation } from "../hooks/useLinkQueries";

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

export function RecentLinkCard({ link, className }: { link: RecentLink; className?: string }) {
  const [faviconError, setFaviconError] = useState(false);
  const visitMutation = useVisitLinkMutation();

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => visitMutation.mutate(link.id)}
      className={cn(
        "w-40 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:w-44",
        className
      )}
    >
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface shadow-sm transition-transform duration-150 hover:scale-[1.02]">
        {link.faviconUrl && !faviconError ? (
          <img
            src={link.faviconUrl}
            alt=""
            className="h-14 w-14"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <Globe className="h-12 w-12 text-ink-soft" />
        )}
      </div>
      <p className="mt-2.5 truncate text-[15px] font-semibold text-ink">{link.title}</p>
      <p className="truncate text-sm text-ink-soft">
        {link.folder.icon ? `${link.folder.icon} ` : ""}
        {link.folder.name}
      </p>
      <p className="truncate text-xs text-ink-soft/70">{getDomain(link.url)}</p>
    </a>
  );
}
