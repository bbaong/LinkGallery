export type CoverType = "SOLID" | "GRADIENT" | "GLASS" | "IMAGE";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  coverType: CoverType;
  coverValue: string;
  position: number;
  linkCount: number;
  createdAt: string;
  updatedAt: string;
}
