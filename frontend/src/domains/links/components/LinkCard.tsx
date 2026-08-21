import { useState } from "react";
import { Globe, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import type { Link } from "../types";
import { useVisitLinkMutation } from "../hooks/useLinkQueries";

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
  const [faviconError, setFaviconError] = useState(false);
  const visitMutation = useVisitLinkMutation();

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => visitMutation.mutate(link.id)}
      draggable={false}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex items-start justify-between gap-2">
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
        <div className="flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            aria-label="링크 수정"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onEdit(link);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="링크 삭제"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete(link);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-6 text-ink">{link.title}</p>
        <p className="mt-1 line-clamp-2 h-10 text-sm leading-5 text-ink-soft">{link.description || "\u00a0"}</p>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <p className="truncate text-xs leading-4 text-ink-soft/80">{getDomain(link.url)}</p>
        <span
          className={cn(
            "h-6 max-w-full truncate rounded-full bg-canvas px-2.5 text-[11px] font-medium leading-6 text-ink-soft",
            link.category ? "w-fit" : "invisible w-fit"
          )}
        >
          {link.category || "카테고리"}
        </span>
      </div>
    </a>
  );
}
