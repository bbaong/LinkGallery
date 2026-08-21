import { useState } from "react";
import { Globe } from "lucide-react";
import type { RecentLink } from "../types";
import { useVisitLinkMutation } from "../hooks/useLinkQueries";

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

export function QuickLaunchItem({ link }: { link: RecentLink }) {
  const [faviconError, setFaviconError] = useState(false);
  const visitMutation = useVisitLinkMutation();

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => visitMutation.mutate(link.id)}
      className="flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-canvas">
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
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{link.title}</p>
        <p className="truncate text-xs text-ink-soft">{getDomain(link.url)}</p>
      </div>
    </a>
  );
}
