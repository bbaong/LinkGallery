import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { BrandGradientPanel } from "../../../shared/ui/BrandGradientPanel";
import { useT } from "../../../shared/i18n/useT";
import { FolderCover } from "./FolderCover";
import type { Folder } from "../types";

interface DashboardHeroProps {
  nickname: string;
  folders: Folder[];
  onCreateFolder: () => void;
}

export function DashboardHero({ nickname, folders, onCreateFolder }: DashboardHeroProps) {
  const { t } = useT();
  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "dash.greetingMorning" : hour < 18 ? "dash.greetingAfternoon" : "dash.greetingEvening";

  const featured = [...folders]
    .filter((folder) => folder.myRole === "OWNER")
    .sort((left, right) => right.linkCount - left.linkCount)[0]
    ?? [...folders].sort((left, right) => right.linkCount - left.linkCount)[0];

  return (
    <section>
      <h1 className="break-keep text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        {t(greetingKey, { name: nickname })}
      </h1>

      {featured ? (
        <Link
          to={`/folders/${featured.id}`}
          className="group relative mt-8 block overflow-hidden rounded-[28px] shadow-[0_18px_50px_rgba(124,58,237,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:shadow-[0_18px_50px_rgba(124,58,237,0.28)]"
        >
          <div className="relative h-56 w-full sm:h-72 lg:h-80">
            <FolderCover coverType={featured.coverType} coverValue={featured.coverValue} />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
              <div className="min-w-0 text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]">
                <p className="text-sm font-medium text-white/90">{t("dash.featuredFolder")}</p>
                <p className="mt-1 truncate text-3xl font-bold tracking-tight sm:text-4xl">
                  {featured.icon ? `${featured.icon} ` : ""}
                  {featured.name}
                </p>
                <p className="mt-1 text-sm text-white/75">
                  {t("common.countLinks", { count: featured.linkCount })}
                </p>
              </div>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[#16151a] shadow-lg transition-transform duration-150 group-hover:scale-105">
                <Play className="h-6 w-6 fill-current" />
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <BrandGradientPanel className="mt-8">
          <div className="flex min-h-56 flex-col items-start justify-end px-8 py-8">
            <p className="text-lg font-semibold">{t("dash.emptyTitle")}</p>
            <p className="mt-1 text-sm text-white/80">{t("dash.emptyBody")}</p>
            <button
              type="button"
              onClick={onCreateFolder}
              className="mt-5 inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              {t("dash.firstFolder")}
            </button>
          </div>
        </BrandGradientPanel>
      )}
    </section>
  );
}
