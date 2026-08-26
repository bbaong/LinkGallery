import { useEffect, useRef, useState, type ReactNode } from "react";
import { CoverStylePicker, normalizeCoverType } from "../../folders/components/CoverStylePicker";
import { DEFAULT_SOLID_COLOR } from "../../folders/constants/coverColors";
import type { CoverType } from "../../folders/types";
import { cn } from "../../../shared/lib/cn";

interface AppearancePopoverProps {
  title: string;
  coverType: CoverType | null | undefined;
  coverValue: string | null | undefined;
  fallbackImageUrl?: string | null;
  onChange: (next: { coverType: Exclude<CoverType, "GLASS">; coverValue: string }) => Promise<void> | void;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  trigger: ReactNode;
  align?: "left" | "right";
  placement?: "bottom" | "top";
  panelClassName?: string;
}

export function appearanceFromCover(
  coverType: CoverType | null | undefined,
  coverValue: string | null | undefined,
  fallbackImageUrl?: string | null
): { coverType: Exclude<CoverType, "GLASS">; coverValue: string } {
  if (coverType && coverType !== "GLASS" && coverValue) {
    return { coverType: normalizeCoverType(coverType), coverValue };
  }
  if (fallbackImageUrl) return { coverType: "IMAGE", coverValue: fallbackImageUrl };
  return { coverType: "SOLID", coverValue: DEFAULT_SOLID_COLOR };
}

export function AppearancePopover({
  title,
  coverType,
  coverValue,
  fallbackImageUrl,
  onChange,
  onUpload,
  isUploading,
  trigger,
  align = "left",
  placement = "bottom",
  panelClassName,
}: AppearancePopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(appearanceFromCover(coverType, coverValue, fallbackImageUrl));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(appearanceFromCover(coverType, coverValue, fallbackImageUrl));
  }, [open, coverType, coverValue, fallbackImageUrl]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open ? (
        <div
          className={cn(
            "absolute z-40 w-[22rem] rounded-3xl border border-line bg-surface p-4 shadow-xl",
            align === "right" ? "right-0" : "left-0",
            placement === "top" ? "bottom-full mb-2" : "top-[calc(100%+8px)]",
            panelClassName
          )}
        >
          <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
          <CoverStylePicker
            coverType={draft.coverType}
            coverValue={draft.coverValue}
            isUploading={isUploading}
            onChange={async (next) => {
              setDraft(next);
              if (next.coverType === "IMAGE" && !next.coverValue) return;
              await onChange(next);
            }}
            onUpload={onUpload}
          />
        </div>
      ) : null}
    </div>
  );
}
