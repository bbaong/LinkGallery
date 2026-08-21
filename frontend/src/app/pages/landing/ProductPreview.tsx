import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { FolderCover } from "../../../domains/folders/components/FolderCover";
import { cn } from "../../../shared/lib/cn";
import type { CoverType } from "../../../domains/folders/types";

interface DemoLink {
  title: string;
  note: string;
}

interface DemoFolder {
  name: string;
  icon: string;
  coverType: CoverType;
  coverValue: string;
  links: DemoLink[];
}

const DEMO_FOLDERS: DemoFolder[] = [
  {
    name: "디자인 영감",
    icon: "🎨",
    coverType: "GRADIENT",
    coverValue: "LAVENDER",
    links: [
      { title: "오늘의 무드", note: "색과 레이아웃 모음" },
      { title: "컬러 노트", note: "마음에 든 팔레트" },
      { title: "레이아웃 스크랩", note: "나중에 다시 볼 화면" },
    ],
  },
  {
    name: "취업 준비",
    icon: "⭐",
    coverType: "GRADIENT",
    coverValue: "PEACH",
    links: [
      { title: "공고 모아보기", note: "이번 주 지원할 곳" },
      { title: "포트폴리오", note: "제출용 자료" },
      { title: "면접 메모", note: "질문과 답변 정리" },
    ],
  },
  {
    name: "위시리스트",
    icon: "✨",
    coverType: "GRADIENT",
    coverValue: "SKY",
    links: [
      { title: "사고 싶은 것", note: "나중에 살 목록" },
      { title: "비교해 둔 옵션", note: "아직 고르는 중" },
      { title: "선물 아이디어", note: "챙겨 둘 링크" },
    ],
  },
  {
    name: "여행 준비",
    icon: "✈️",
    coverType: "GRADIENT",
    coverValue: "MINT",
    links: [
      { title: "가고 싶은 곳", note: "지도에 찍어 둔 장소" },
      { title: "숙소 메모", note: "분위기 보고 저장" },
      { title: "루트 스케치", note: "대략의 동선" },
    ],
  },
];

export function ProductPreview() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const active = DEMO_FOLDERS[activeIndex];

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
          <p className="text-sm font-semibold text-ink">최근 접속한 사이트</p>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {active.links.map((link) => (
              <div
                key={`${active.name}-${link.title}`}
                className="rounded-2xl border border-line bg-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-canvas">
                    <Globe className="h-3.5 w-3.5 text-ink-soft" />
                  </span>
                  <span className="truncate rounded-full bg-canvas px-2 py-0.5 text-[11px] text-ink-soft">
                    {active.icon} {active.name}
                  </span>
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-ink">{link.title}</p>
                <p className="truncate text-[11px] text-ink-soft">{link.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between">
            <p className="text-sm font-semibold text-ink">내 폴더</p>
            <p className="text-xs text-ink-soft">폴더를 눌러 살펴보세요</p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {DEMO_FOLDERS.map((folder, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={folder.name}
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
                  <p className="mt-2 truncate text-[13px] font-semibold text-ink">{folder.name}</p>
                  <p className="text-[11px] text-ink-soft">{folder.links.length}개의 링크</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
