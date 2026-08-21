import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { FolderCover } from "./FolderCover";
import type { Folder } from "../types";

interface FolderCardProps {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export function FolderCard({ folder, onEdit, onDelete }: FolderCardProps) {
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
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            aria-label="폴더 수정"
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
            aria-label="폴더 삭제"
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
      </div>
      <div className="px-1">
        <p className="truncate text-[15px] font-semibold text-ink">{folder.name}</p>
        <p className="text-sm text-ink-soft">{folder.linkCount}개의 링크</p>
      </div>
    </Link>
  );
}
