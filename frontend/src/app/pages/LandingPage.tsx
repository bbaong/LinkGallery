import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderHeart, Layers3, MousePointerClick, Palette } from "lucide-react";
import { PageContainer } from "../../shared/ui/PageContainer";
import { Button } from "../../shared/ui/Button";
import { ThemeToggle } from "../../shared/ui/ThemeToggle";
import { Logo } from "../../shared/ui/Logo";
import { useT } from "../../shared/i18n/useT";
import { LocaleToggle } from "../../shared/i18n/LocaleToggle";
import { HeroSection } from "./landing/HeroSection";
import { Reveal } from "./landing/Reveal";

export function LandingPage() {
  const { t } = useT();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frame = 0;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrolled = scrollY > 8;

  const steps = [
    { step: "01", title: t("landing.step1Title"), body: t("landing.step1Body") },
    { step: "02", title: t("landing.step2Title"), body: t("landing.step2Body") },
    { step: "03", title: t("landing.step3Title"), body: t("landing.step3Body") },
  ];

  const features = [
    { icon: Palette, title: t("landing.feat1Title"), body: t("landing.feat1Body") },
    { icon: Layers3, title: t("landing.feat2Title"), body: t("landing.feat2Body") },
    { icon: MousePointerClick, title: t("landing.feat3Title"), body: t("landing.feat3Body") },
    { icon: FolderHeart, title: t("landing.feat4Title"), body: t("landing.feat4Body") },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <header
        className={`fixed inset-x-0 top-0 z-30 border-b bg-canvas/80 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "border-line shadow-sm" : "border-transparent"
        }`}
      >
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle compact />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t("landing.login")}
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">{t("landing.getStarted")}</Button>
            </Link>
          </div>
        </PageContainer>
      </header>

      <main className="overflow-x-hidden pt-16">
        <HeroSection scrollY={scrollY} />

        <section>
          <PageContainer className="py-20 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-brand-600">{t("landing.howItWorks")}</p>
              <h2 className="mt-2 break-keep text-3xl font-bold tracking-tight text-ink">
                {t("landing.howTitle")}
              </h2>
              <p className="mt-3 break-keep text-ink-soft">{t("landing.howBody")}</p>
            </Reveal>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map((item, index) => (
                <li key={item.step}>
                  <Reveal delay={index * 90} className="h-full">
                    <div className="h-full rounded-3xl border border-line bg-surface p-6 shadow-sm">
                      <span className="text-sm font-semibold text-brand-600">{item.step}</span>
                      <h3 className="mt-3 text-lg font-semibold text-ink">{item.title}</h3>
                      <p className="mt-2 break-keep text-sm leading-relaxed text-ink-soft">{item.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </PageContainer>
        </section>

        <section className="bg-surface/50">
          <PageContainer className="py-20 sm:py-24">
            <Reveal className="max-w-2xl">
              <p className="text-sm font-medium text-brand-600">{t("landing.whyEyebrow")}</p>
              <h2 className="mt-2 break-keep text-3xl font-bold tracking-tight text-ink">
                {t("landing.whyTitle")}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <Reveal key={feature.title} delay={index * 80}>
                  <article className="h-full rounded-3xl border border-line bg-canvas p-6">
                    <feature.icon className="h-5 w-5 text-brand-600" />
                    <h3 className="mt-4 text-lg font-semibold text-ink">{feature.title}</h3>
                    <p className="mt-2 break-keep text-sm leading-relaxed text-ink-soft">{feature.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </PageContainer>
        </section>

        <section>
          <PageContainer className="py-20 sm:py-24">
            <Reveal>
              <div className="overflow-hidden rounded-[32px] border border-line bg-gradient-to-br from-brand-600 to-[#4c1d95] px-8 py-14 text-center text-white shadow-lg sm:px-16">
                <h2 className="break-keep text-3xl font-bold leading-snug tracking-tight">
                  {t("landing.ctaTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-lg break-keep text-sm leading-relaxed text-white/80 sm:text-base">
                  {t("landing.ctaBody")}
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/signup"
                    className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    {t("landing.startNow")}
                  </Link>
                </div>
              </div>
            </Reveal>
          </PageContainer>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <PageContainer className="flex flex-col items-center justify-between gap-3 text-sm text-ink-soft sm:flex-row">
          <Logo />
          <p className="break-keep">
            {t("landing.heroLine1")} {t("landing.heroLine2")}
          </p>
        </PageContainer>
      </footer>
    </div>
  );
}
