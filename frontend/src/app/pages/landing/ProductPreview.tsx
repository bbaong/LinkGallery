import { useEffect, useState } from "react";
import { Play } from "lucide-react";
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
      <div className="rounded-[28px] border border-line bg-canvas p-4 shadow-sm sm:p-5">
        <h2 className="text-2xl font-bold tracking-tight text-ink">{t("landing.previewGreeting")}</h2>

        <div className="relative mt-5 overflow-hidden rounded-[28px] shadow-[0_18px_50px_rgba(124,58,237,0.18)]">
          <div className="relative h-40 w-full sm:h-48">
            <FolderCover coverType={active.coverType} coverValue={active.coverValue} />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
              <div className="min-w-0 text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]">
                <p className="text-sm font-medium text-white/90">{t("dash.featuredFolder")}</p>
                <p className="mt-1 truncate text-2xl font-bold tracking-tight">
                  {active.icon} {activeName}
                </p>
                <p className="mt-1 text-sm text-white/75">
                  {t("common.countLinks", { count: active.links.length })}
                </p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#16151a] shadow-lg">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="text-sm font-semibold text-ink">{t("dash.myFolders")}</p>
          <p className="text-xs text-ink-soft">{t("landing.previewHint")}</p>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {DEMO_FOLDERS.map((folder, index) => {
            const selected = index === activeIndex;
            const name = t(folder.nameKey);
            return (
              <button key={folder.nameKey} type="button" onClick={() => setActiveIndex(index)} className="text-left">
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
  );
}
