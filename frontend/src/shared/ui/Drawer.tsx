import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useT } from "../i18n/useT";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const { t } = useT();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "absolute flex flex-col bg-surface shadow-2xl",
          "inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl",
          "md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[min(24rem,100vw)] md:rounded-none"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 md:px-6">
          <h2 id="drawer-title" className="text-base font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="rounded-full p-2 text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 md:px-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
