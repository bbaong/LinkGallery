import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Button } from "../../../shared/ui/Button";
import { APP_NAME } from "../../../shared/constants/app";
import { useT } from "../../../shared/i18n/useT";
import { useAuthStore } from "../../../domains/auth/store/authStore";
import { ProductPreview } from "./ProductPreview";
import { MarqueeTags } from "./MarqueeTags";
import { AmbientGlow } from "../../../shared/ui/AmbientGlow";

interface HeroSectionProps {
  scrollY: number;
}

export function HeroSection({ scrollY }: HeroSectionProps) {
  const { t } = useT();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return (
    <section className="relative">
      <AmbientGlow scrollY={scrollY} />

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
            <div className="mt-8 flex min-h-11 flex-wrap gap-3">
              {!isInitialized ? null : user ? (
                <Link to="/dashboard">
                  <Button>{t("landing.openApp")}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button>{t("landing.startNow")}</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary">{t("landing.login")}</Button>
                  </Link>
                </>
              )}
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
