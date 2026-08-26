import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { FolderCover } from "../../../domains/folders/components/FolderCover";
import { cn } from "../../../shared/lib/cn";
import type { CoverType } from "../../../domains/folders/types";
import { useT } from "../../../shared/i18n/useT";
import type { MessageKey } from "../../../shared/i18n/messages";

interface DemoLink {
  titleKey: MessageKey;
  noteKey: MessageKey;
}

interface DemoFolder {
  nameKey: MessageKey;
  icon: string;
  coverType: CoverType;
  coverValue: string;
  links: DemoLink[];
}

const DEMO_FOLDERS: DemoFolder[] = [
  {
    nameKey: "landing.demo1Name",
    icon: "🎨",
    coverType: "GRADIENT",
    coverValue: "LAVENDER",
    links: [
      { titleKey: "landing.demo1L1", noteKey: "landing.demo1N1" },
      { titleKey: "landing.demo1L2", noteKey: "landing.demo1N2" },
      { titleKey: "landing.demo1L3", noteKey: "landing.demo1N3" },
    ],
  },
  {
    nameKey: "landing.demo2Name",
    icon: "⭐",
    coverType: "GRADIENT",
    coverValue: "PEACH",
    links: [
      { titleKey: "landing.demo2L1", noteKey: "landing.demo2N1" },
      { titleKey: "landing.demo2L2", noteKey: "landing.demo2N2" },
      { titleKey: "landing.demo2L3", noteKey: "landing.demo2N3" },
    ],
  },
  {
    nameKey: "landing.demo3Name",
    icon: "✨",
    coverType: "GRADIENT",
    coverValue: "SKY",
    links: [
      { titleKey: "landing.demo3L1", noteKey: "landing.demo3N1" },
      { titleKey: "landing.demo3L2", noteKey: "landing.demo3N2" },
      { titleKey: "landing.demo3L3", noteKey: "landing.demo3N3" },
    ],
  },
  {
    nameKey: "landing.demo4Name",
    icon: "✈️",
    coverType: "GRADIENT",
    coverValue: "MINT",
    links: [
      { titleKey: "landing.demo4L1", noteKey: "landing.demo4N1" },
      { titleKey: "landing.demo4L2", noteKey: "landing.demo4N2" },
      { titleKey: "landing.demo4L3", noteKey: "landing.demo4N3" },
    ],
  },
];

export function ProductPreview() {
  const { t } = useT();
  const [activeIndex, setActiveIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const active = DEMO_FOLDERS[activeIndex];
  const activeName = t(active.nameKey);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % DEMO_FOLDERS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-[28px] border border-line bg-canvas shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs font-medium text-ink-soft">Link Gallery</span>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-sm font-semibold text-ink">{t("dash.recentSites")}</p>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {active.links.map((link) => (
              <div
                key={`${active.nameKey}-${link.titleKey}`}
                className="rounded-2xl border border-line bg-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-canvas">
                    <Globe className="h-3.5 w-3.5 text-ink-soft" />
                  </span>
                  <span className="truncate rounded-full bg-canvas px-2 py-0.5 text-[11px] text-ink-soft">
                    {active.icon} {activeName}
                  </span>
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-ink">{t(link.titleKey)}</p>
                <p className="truncate text-[11px] text-ink-soft">{t(link.noteKey)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between">
            <p className="text-sm font-semibold text-ink">{t("dash.myFolders")}</p>
            <p className="text-xs text-ink-soft">{t("landing.previewHint")}</p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {DEMO_FOLDERS.map((folder, index) => {
              const selected = index === activeIndex;
              const name = t(folder.nameKey);
              return (
                <button
                  key={folder.nameKey}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="text-left"
                >
                  <div
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-2xl transition-shadow",
                      selected ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-canvas" : "shadow-sm"
                    )}
                  >
                    <FolderCover coverType={folder.coverType} coverValue={folder.coverValue} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                    <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-sm shadow-sm">
                      {folder.icon}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-[13px] font-semibold text-ink">{name}</p>
                  <p className="text-[11px] text-ink-soft">
                    {t("common.countLinks", { count: folder.links.length })}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
