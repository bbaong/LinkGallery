export interface Link {
  id: string;
  userId: string;
  folderId: string;
  title: string;
  url: string;
  description: string | null;
  faviconUrl: string | null;
  position: number;
  lastVisitedAt: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecentLink extends Link {
  folder: { id: string; name: string; icon: string | null };
}
