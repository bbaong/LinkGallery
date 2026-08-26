import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Clapperboard,
  CookingPot,
  Dumbbell,
  FolderKanban,
  Lamp,
  LayoutTemplate,
  Newspaper,
  ShoppingBag,
  Sparkles,
  Sprout,
  TreePalm,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { TagChip } from "./TagChip";
import { useT } from "../../../shared/i18n/useT";
import type { MessageKey } from "../../../shared/i18n/messages";

const TAGS: { key: MessageKey; icon: LucideIcon }[] = [
  { key: "landing.tagVideo", icon: Clapperboard },
  { key: "landing.tagCooking", icon: CookingPot },
  { key: "landing.tagMood", icon: Sparkles },
  { key: "landing.tagSide", icon: FolderKanban },
  { key: "landing.tagStudy", icon: BookOpen },
  { key: "landing.tagFood", icon: UtensilsCrossed },
  { key: "landing.tagInterior", icon: Lamp },
  { key: "landing.tagArticles", icon: Newspaper },
  { key: "landing.tagWorkout", icon: Dumbbell },
  { key: "landing.tagWork", icon: Briefcase },
  { key: "landing.tagShopping", icon: ShoppingBag },
  { key: "landing.tagGrowth", icon: Sprout },
  { key: "landing.tagWeekend", icon: TreePalm },
  { key: "landing.tagPortfolio", icon: LayoutTemplate },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function MarqueeTags() {
  const reducedMotion = usePrefersReducedMotion();
  const { t } = useT();

  return (
    <div className="rounded-[28px] border border-brand-500/15 bg-surface/80 p-4 shadow-[0_8px_30px_rgba(124,58,237,0.06)] backdrop-blur-sm sm:p-5 dark:border-brand-300/20 dark:bg-[#26252e] dark:shadow-[inset_0_1px_0_rgba(198,179,255,0.12),0_12px_40px_rgba(0,0,0,0.35),0_8px_28px_rgba(124,58,237,0.18)]">
      <p className="text-[13px] font-medium tracking-tight text-ink-soft">
        {t("landing.marqueeTitle")}
      </p>

      <div
        className={
          reducedMotion
            ? "-mx-1 mt-2 overflow-x-auto px-1 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "group/marquee relative -mx-1 mt-2 overflow-hidden px-1 py-3 [mask-image:linear-gradient(to_right,transparent,black_48px,black_calc(100%-48px),transparent)]"
        }
      >
        {reducedMotion ? (
          <ul className="flex w-max gap-2.5">
            {TAGS.map((tag) => (
              <li key={tag.key}>
                <TagChip icon={tag.icon} label={t(tag.key)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="animate-landing-marquee flex w-max max-sm:[animation-duration:72s]" aria-hidden="true">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className="flex shrink-0 items-center gap-2.5 pr-2.5"
              >
                {TAGS.map((tag) => (
                  <li key={`${copy}-${tag.key}`}>
                    <TagChip icon={tag.icon} label={t(tag.key)} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
