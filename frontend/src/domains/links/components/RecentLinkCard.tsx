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
        "flex w-64 shrink-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-canvas">
          {link.faviconUrl && !faviconError ? (
            <img
              src={link.faviconUrl}
              alt=""
              className="h-5 w-5"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <Globe className="h-4 w-4 text-ink-soft" />
          )}
        </div>
        <span className="truncate rounded-full bg-canvas px-2.5 py-1 text-xs text-ink-soft">
          {link.folder.icon ? `${link.folder.icon} ` : ""}
          {link.folder.name}
        </span>
      </div>
      <div>
        <p className="truncate text-[15px] font-semibold text-ink">{link.title}</p>
        <p className="truncate text-xs text-ink-soft/80">{getDomain(link.url)}</p>
      </div>
    </a>
  );
}
