import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Button } from "../../../shared/ui/Button";
import { APP_NAME } from "../../../shared/constants/app";
import { useT } from "../../../shared/i18n/useT";
import { ProductPreview } from "./ProductPreview";
import { MarqueeTags } from "./MarqueeTags";

interface HeroSectionProps {
  scrollY: number;
}

export function HeroSection({ scrollY }: HeroSectionProps) {
  const { t } = useT();

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl dark:h-[26rem] dark:w-[26rem] dark:bg-brand-500/35 dark:blur-[90px]"
          style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0)` }}
        />
        <div
          className="absolute right-0 top-32 h-80 w-80 rounded-full bg-brand-300/35 blur-3xl dark:bg-brand-300/30 dark:blur-[90px]"
          style={{ transform: `translate3d(0, ${scrollY * -0.12}px, 0)` }}
        />
        <div
          className="absolute bottom-8 left-1/3 h-56 w-56 rounded-full bg-brand-100/70 blur-3xl dark:h-72 dark:w-72 dark:bg-brand-600/30 dark:blur-[80px]"
          style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0)` }}
        />
      </div>

      <PageContainer className="relative pb-12 pt-16 lg:pb-16 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-12">
          <div className="animate-landing-rise min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-sm text-ink-soft">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              {APP_NAME}
            </p>
            <h1 className="mt-5 break-keep text-[1.875rem] font-bold leading-[1.4] tracking-tight text-ink sm:text-4xl sm:leading-[1.35] lg:text-[2.5rem] lg:leading-[1.4]">
              <span className="block">{t("landing.heroLine1")}</span>
              <span className="block">{t("landing.heroLine2")}</span>
            </h1>
            <p className="mt-5 max-w-lg break-keep text-base leading-relaxed text-ink-soft sm:text-lg">
              {t("landing.heroBody")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button>{t("landing.startNow")}</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">{t("landing.login")}</Button>
              </Link>
            </div>
          </div>

          <div
            className="min-w-0"
            style={{ transform: `translate3d(0, ${Math.min(scrollY, 280) * -0.08}px, 0)` }}
          >
            <ProductPreview />
          </div>
        </div>

        <div className="mt-10 lg:mt-14">
          <MarqueeTags />
        </div>
      </PageContainer>
    </section>
  );
}
