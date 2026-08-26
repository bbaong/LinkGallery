import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import type { Link } from "../types";
import type { LinkViewMode } from "../../../shared/preferences/linkView";
import { LinkCard } from "./LinkCard";
import { useT } from "../../../shared/i18n/useT";

function moveItem<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface SortableLinkGridProps {
  links: Link[];
  canReorder: boolean;
  onReorder: (orderedIds: string[]) => void;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  showCreator?: boolean;
  view?: LinkViewMode;
}

export function SortableLinkGrid({
  links,
  canReorder,
  onReorder,
  onEdit,
  onDelete,
  showCreator = false,
  view = "card",
}: SortableLinkGridProps) {
  const { t } = useT();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const suppressClickRef = useRef(false);

  function beginDrag(linkId: string, event: DragEvent) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", linkId);
    suppressClickRef.current = true;
    setDraggingId(linkId);
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    const from = links.findIndex((link) => link.id === draggingId);
    const to = links.findIndex((link) => link.id === targetId);
    if (from < 0 || to < 0) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    onReorder(moveItem(links, from, to).map((link) => link.id));
    setDraggingId(null);
    setOverId(null);
  }

  return (
    <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {links.map((link) => (
        <div
          key={link.id}
          draggable={canReorder}
          onClickCapture={(event) => {
            if (!suppressClickRef.current) return;
            event.preventDefault();
            event.stopPropagation();
          }}
          onDragStart={(event) => {
            if (!canReorder) return;
            const target = event.target as HTMLElement;
            if (target.closest("button") && !target.closest("[data-drag-handle]")) {
              event.preventDefault();
              return;
            }
            beginDrag(link.id, event);
          }}
          onDragOver={(event) => {
            if (!canReorder || !draggingId) return;
            event.preventDefault();
            setOverId(link.id);
          }}
          onDrop={(event) => {
            if (!canReorder) return;
            event.preventDefault();
            handleDrop(link.id);
          }}
          onDragEnd={() => {
            setDraggingId(null);
            setOverId(null);
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 50);
          }}
          className={cn(
            "group relative h-full rounded-2xl",
            canReorder && "cursor-grab active:cursor-grabbing",
            draggingId === link.id && "opacity-50",
            overId === link.id && draggingId && draggingId !== link.id && "ring-2 ring-brand-500 ring-offset-2 ring-offset-canvas"
          )}
        >
          {canReorder ? (
            <button
              type="button"
              data-drag-handle
              aria-label={t("link.reorderAria")}
              className={cn(
                "absolute left-2 top-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-full bg-surface/90 text-ink-soft shadow-sm transition-opacity hover:bg-surface hover:text-ink active:cursor-grabbing",
                draggingId === link.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              )}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : null}
          <LinkCard link={link} onEdit={onEdit} onDelete={onDelete} showCreator={showCreator} view={view} />
        </div>
      ))}
    </div>
  );
}
