import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useT } from "../../../shared/i18n/useT";

interface FolderActionsMenuProps {
  isOwner: boolean;
  onEdit: () => void;
  onInvite: () => void;
  onDelete: () => void;
  onLeave: () => void;
}

export function FolderActionsMenu({
  isOwner,
  onEdit,
  onInvite,
  onDelete,
  onLeave,
}: FolderActionsMenuProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("folder.moreActions")}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-full z-40 w-44 pt-1.5">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-xl">
            {isOwner ? (
              <>
                <MenuItem onClick={() => run(onEdit)}>{t("folder.editTitle")}</MenuItem>
                <MenuItem onClick={() => run(onInvite)}>{t("folder.invite")}</MenuItem>
                <MenuItem danger onClick={() => run(onDelete)}>
                  {t("common.delete")}
                </MenuItem>
              </>
            ) : (
              <MenuItem danger onClick={() => run(onLeave)}>
                {t("folder.leave")}
              </MenuItem>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  children,
  danger,
  onClick,
}: {
  children: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        danger
          ? "flex w-full items-center px-3 py-2.5 text-left text-sm text-red-500 hover:bg-canvas"
          : "flex w-full items-center px-3 py-2.5 text-left text-sm text-ink hover:bg-canvas"
      }
    >
      {children}
    </button>
  );
}
