import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FolderCover } from "./FolderCover";
import type { Folder } from "../types";

function greeting(nickname: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `좋은 아침이에요, ${nickname}님`;
  if (hour < 18) return `좋은 오후예요, ${nickname}님`;
  return `좋은 저녁이에요, ${nickname}님`;
}

interface DashboardHeroProps {
  nickname: string;
  folders: Folder[];
  onCreateFolder: () => void;
}

export function DashboardHero({ nickname, folders, onCreateFolder }: DashboardHeroProps) {
  const folderCount = folders.length;
  const linkCount = folders.reduce((sum, folder) => sum + folder.linkCount, 0);
  const featured = [...folders].sort((left, right) => right.linkCount - left.linkCount)[0];
  const previews = folders.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#8fc7ff] via-brand-600 to-[#ff9d8a] p-6 text-white shadow-lg sm:p-8">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="text-sm text-white/80">{greeting(nickname)}</p>
          <h1 className="mt-2 break-keep text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            오늘도 자주 가는 곳을,
            <br />
            여기서 바로 시작해요
          </h1>
          <p className="mt-3 text-sm text-white/80">
            {folderCount > 0
              ? `${folderCount}개의 폴더 · ${linkCount}개의 링크가 당신을 기다리고 있어요`
              : "첫 폴더를 만들고 자주 가는 곳을 모아보세요"}
          </p>
          <div className="mt-6">
            {featured ? (
              <Link
                to={`/folders/${featured.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
              >
                가장 많이 쓰는 · {featured.name} 열기
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onCreateFolder}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
              >
                첫 폴더 만들기
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {previews.length > 0 ? (
          <div className="hidden shrink-0 items-center pr-2 sm:flex">
            {previews.map((folder, index) => (
              <div
                key={folder.id}
                className="h-16 w-16 overflow-hidden rounded-2xl border border-white/40 shadow-lg"
                style={{
                  marginLeft: index === 0 ? 0 : -12,
                  transform: `rotate(${(index - 1) * 8}deg)`,
                  zIndex: previews.length - index,
                }}
              >
                <FolderCover coverType={folder.coverType} coverValue={folder.coverValue} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
