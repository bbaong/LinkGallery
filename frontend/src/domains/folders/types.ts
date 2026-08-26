export type CoverType = "SOLID" | "GRADIENT" | "GLASS" | "IMAGE";
export type FolderRole = "OWNER" | "EDITOR";

export interface FolderPerson {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  avatarType?: CoverType | null;
  avatarValue?: string | null;
}

export interface FolderMember extends FolderPerson {
  role: FolderRole;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  coverType: CoverType;
  coverValue: string;
  position: number;
  linkCount: number;
  myRole: FolderRole;
  memberCount: number;
  owner: FolderPerson;
  members?: FolderMember[];
  inviteCode?: string | null;
  createdAt: string;
  updatedAt: string;
}
