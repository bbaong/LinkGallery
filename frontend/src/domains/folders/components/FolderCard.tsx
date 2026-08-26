import { Link } from "react-router-dom";
import { Pencil, Trash2, Users } from "lucide-react";
import { FolderCover } from "./FolderCover";
import type { Folder } from "../types";
import { useT } from "../../../shared/i18n/useT";

interface FolderCardProps {
  folder: Folder;
  onEdit?: (folder: Folder) => void;
  onDelete?: (folder: Folder) => void;
}

export function FolderCard({ folder, onEdit, onDelete }: FolderCardProps) {
  const { t } = useT();
  const isOwner = folder.myRole === "OWNER";
  const shared = folder.memberCount > 1;

  return (
    <Link
      to={`/folders/${folder.id}`}
      className="group flex flex-col gap-3 rounded-3xl p-2 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-sm">
        <FolderCover coverType={folder.coverType} coverValue={folder.coverValue} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        {folder.icon ? (
          <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-lg shadow-sm backdrop-blur">
            {folder.icon}
          </span>
        ) : null}
        {shared ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-[#16151a] shadow-sm">
            <Users className="h-3 w-3" />
            {t("common.countPeople", { count: folder.memberCount })}
          </span>
        ) : null}
        {isOwner && onEdit && onDelete ? (
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              aria-label={t("folder.editTitle")}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onEdit(folder);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#16151a] shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("dash.deleteTitle")}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete(folder);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="px-1">
        <p className="truncate text-[15px] font-semibold text-ink">{folder.name}</p>
        <p className="text-sm text-ink-soft">{t("common.countLinks", { count: folder.linkCount })}</p>
        {shared && !isOwner ? (
          <p className="mt-0.5 truncate text-xs text-ink-soft">
            {folder.owner.nickname}
            {folder.memberCount > 2 ? t("common.morePeople", { count: folder.memberCount - 1 }) : null}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
