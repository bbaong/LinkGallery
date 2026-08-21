import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderHeart, Layers3, MousePointerClick, Palette, Sparkles } from "lucide-react";
import { PageContainer } from "../../shared/ui/PageContainer";
import { Button } from "../../shared/ui/Button";
import { Logo } from "../../shared/ui/Logo";
import { APP_NAME, APP_TAGLINE } from "../../shared/constants/app";
import { ProductPreview } from "./landing/ProductPreview";
import { Reveal } from "./landing/Reveal";

const USE_CASES = [
  "디자인 영감",
  "취업 준비",
  "위시리스트",
  "여행 준비",
  "작업 레퍼런스",
  "나중에 볼 영상",
  "요리 메모",
  "오늘의 무드",
];

const STEPS = [
  {
    step: "01",
    title: "카테고리로 모아요",
    body: "브라우저 즐겨찾기, 메모, 메신저에 흩어진 북마크를 주제별 폴더로 한곳에 담습니다.",
  },
  {
    step: "02",
    title: "폴더를 내 취향대로",
    body: "커버 색, 그라데이션, 이모지까지 직접 골라 나만의 공간처럼 꾸밀 수 있어요.",
  },
  {
    step: "03",
    title: "열면 바로 들어가요",
    body: "Link Gallery 하나만 켜면, 자주 가는 사이트에 헤매지 않고 빠르게 접속합니다.",
  },
];

const FEATURES = [
  {
    icon: Palette,
    title: "개인 커스텀 폴더",
    body: "단색, 그라데이션, 이미지와 아이콘으로 폴더를 꾸밉니다. 남이 만든 목록이 아니라, 내 공간이에요.",
  },
  {
    icon: Layers3,
    title: "카테고리별로 보기 좋게",
    body: "즐겨찾기가 탭마다, 기기마다 흩어지지 않습니다. 주제별로 모아 두면 찾는 시간이 줄어듭니다.",
  },
  {
    icon: MousePointerClick,
    title: "하나면 바로 접속",
    body: "검색창을 다시 열 필요 없이, 폴더를 열고 카드만 누르면 그 사이트로 들어갑니다.",
  },
  {
    icon: FolderHeart,
    title: "자주 가는 곳만 모아서",
    body: "북마크 바를 뒤지지 않아도 됩니다. 최근에 연 사이트도 홈에 남아 이어서 갈 수 있어요.",
  },
];

export function LandingPage() {
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas">
      <header
        className={`sticky top-0 z-30 border-b bg-canvas/80 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "border-line shadow-sm" : "border-transparent"
        }`}
      >
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">시작하기</Button>
            </Link>
          </div>
        </PageContainer>
      </header>

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
              style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0)` }}
            />
            <div
              className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#8fc7ff]/25 blur-3xl"
              style={{ transform: `translate3d(0, ${scrollY * -0.12}px, 0)` }}
            />
            <div
              className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#ff9d8a]/20 blur-3xl"
              style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0)` }}
            />
          </div>

          <PageContainer className="relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
            <div className="animate-landing-rise min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-sm text-ink-soft">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                {APP_NAME}
              </p>
              <h1 className="mt-5 break-keep text-[1.875rem] font-bold leading-[1.4] tracking-tight text-ink sm:text-4xl sm:leading-[1.35] lg:text-[2.5rem] lg:leading-[1.4]">
                <span className="block">자주 찾는 인터넷 공간을,</span>
                <span className="block">나만의 플레이리스트처럼.</span>
              </h1>
              <p className="mt-5 max-w-lg break-keep text-base leading-relaxed text-ink-soft sm:text-lg">
                여기저기 흩어진 북마크와 즐겨찾기 대신, 카테고리별로 보기 좋게 모으세요. 폴더는 내 마음대로
                꾸밀 수 있고, Link Gallery 하나면 자주 가는 사이트에 바로 들어갑니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button>지금 시작하기</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary">로그인</Button>
                </Link>
              </div>
            </div>

            <div
              className="min-w-0"
              style={{ transform: `translate3d(0, ${Math.min(scrollY, 280) * -0.08}px, 0)` }}
            >
              <ProductPreview />
            </div>
          </PageContainer>
        </section>

        <section className="border-y border-line bg-surface/40 py-5">
          <div className="overflow-hidden">
            <div className="animate-landing-marquee flex w-max motion-reduce:animate-none">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex gap-3 px-1.5">
                  {USE_CASES.map((item) => (
                    <span
                      key={`${copy}-${item}`}
                      className="rounded-full border border-line bg-canvas px-4 py-1.5 text-sm text-ink-soft"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <PageContainer className="py-20 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-brand-600">이렇게 쓰여요</p>
              <h2 className="mt-2 break-keep text-3xl font-bold tracking-tight text-ink">
                모으고, 꾸미고, 바로 들어간다
              </h2>
              <p className="mt-3 break-keep text-ink-soft">
                흩어진 즐겨찾기를 카테고리로 정리하고, 내 폴더에서 한 번에 엽니다.
              </p>
            </Reveal>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {STEPS.map((item, index) => (
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
              <p className="text-sm font-medium text-brand-600">왜 Link Gallery인가요</p>
              <h2 className="mt-2 break-keep text-3xl font-bold tracking-tight text-ink">
                커스텀 폴더, 카테고리, 빠른 접속
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature, index) => (
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
                  Link Gallery 하나면, 자주 가는 곳에 바로
                </h2>
                <p className="mx-auto mt-3 max-w-lg break-keep text-sm leading-relaxed text-white/80 sm:text-base">
                  북마크를 찾아 헤매지 마세요. 내 폴더에 모아 두고, 필요할 때 바로 여세요.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/signup"
                    className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    지금 시작하기
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
          <p className="break-keep">{APP_TAGLINE}</p>
        </PageContainer>
      </footer>
    </div>
  );
}
