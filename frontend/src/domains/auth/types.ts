import type { CoverType } from "../folders/types";

export interface User {
  id: string;
  username: string;
  email: string | null;
  nickname: string;
  avatarUrl: string | null;
  avatarType?: CoverType | null;
  avatarValue?: string | null;
  bannerType?: CoverType;
  bannerValue?: string;
  hasPassword?: boolean;
  provider?: "LOCAL" | "GOOGLE";
  createdAt: string;
}
