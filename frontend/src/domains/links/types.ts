import type { CoverType } from "../folders/types";

export interface LinkCreator {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  avatarType?: CoverType | null;
  avatarValue?: string | null;
}

export interface Link {
  id: string;
  userId: string;
  folderId: string;
  title: string;
  url: string;
  description: string | null;
  faviconUrl: string | null;
  previewImageUrl?: string | null;
  position: number;
  lastVisitedAt: string | null;
  category: string | null;
  createdBy?: LinkCreator | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecentLink extends Link {
  folder: { id: string; name: string; icon: string | null };
}
