import { useEffect, useState } from "react";
import { Globe, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import { UserAvatar } from "../../../shared/ui/UserAvatar";
import type { Link } from "../types";
import type { LinkViewMode } from "../../../shared/preferences/linkView";
import {
  markLinkPreviewAttempted,
  shouldRefreshLinkPreview,
  useRefreshLinkPreviewMutation,
  useVisitLinkMutation,
} from "../hooks/useLinkQueries";
import { useT } from "../../../shared/i18n/useT";

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  showCreator?: boolean;
  view?: LinkViewMode;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

export function LinkCard({
  link,
  onEdit,
  onDelete,
  showCreator = false,
  view = "card",
}: LinkCardProps) {
  const [faviconError, setFaviconError] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const visitMutation = useVisitLinkMutation();
  const { mutate: refreshPreview } = useRefreshLinkPreviewMutation();
  const domain = getDomain(link.url);
  const preview = view === "preview";
  const previewSrc = previewError ? null : link.previewImageUrl ?? null;
  const { t } = useT();

  useEffect(() => {
    setPreviewError(false);
  }, [link.previewImageUrl]);

  useEffect(() => {
    if (!preview || !shouldRefreshLinkPreview(link)) return;
    markLinkPreviewAttempted(link.id);
    refreshPreview(link.id);
  }, [preview, link, refreshPreview]);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => visitMutation.mutate(link.id)}
      draggable={false}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {preview ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-top"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-500/15 via-canvas to-canvas">
              {link.faviconUrl && !faviconError ? (
                <img
                  src={link.faviconUrl}
                  alt=""
                  className="h-12 w-12 rounded-xl"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <Globe className="h-10 w-10 text-ink-soft" />
              )}
            </div>
          )}
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
            <CardActions link={link} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 p-4 pb-0">
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
            <CardActions link={link} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      )}

      <div className={cn("flex min-h-0 flex-1 flex-col", preview ? "gap-2 p-3" : "gap-3 p-4 pt-3")}>
        <div className="min-h-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-6 text-ink">{link.title}</p>
          {preview ? null : (
            <p className="mt-1 line-clamp-2 h-10 text-sm leading-5 text-ink-soft">{link.description || "\u00a0"}</p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs leading-4 text-ink-soft/80">{domain}</p>
            <span
              className={cn(
                "mt-2 inline-block h-6 max-w-full truncate rounded-full bg-canvas px-2.5 text-[11px] font-medium leading-6 text-ink-soft",
                link.category ? "w-fit" : "invisible w-fit"
              )}
            >
              {link.category || t("common.category")}
            </span>
          </div>
          {showCreator && link.createdBy ? (
            <span
              title={t("common.addedBy", { name: link.createdBy.nickname })}
              className="mb-0.5 flex min-w-0 max-w-[46%] items-center gap-1.5"
            >
              <UserAvatar nickname={link.createdBy.nickname} avatarUrl={link.createdBy.avatarUrl} avatarType={link.createdBy.avatarType} avatarValue={link.createdBy.avatarValue} size="sm" />
              <span className="truncate text-[11px] text-ink-soft">{link.createdBy.nickname}</span>
            </span>
          ) : null}
        </div>
      </div>
    </a>
  );
}

function CardActions({
  link,
  onEdit,
  onDelete,
}: {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}) {
  const { t } = useT();

  return (
    <>
      <button
        type="button"
        aria-label={t("link.editAria")}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onEdit(link);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink-soft shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={t("link.deleteAria")}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDelete(link);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-red-500 shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );
}
