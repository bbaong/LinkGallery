export type CoverType = "SOLID" | "GRADIENT" | "GLASS" | "IMAGE";
export type FolderRole = "OWNER" | "EDITOR";
export type FolderInviteStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

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

export interface FolderInvite {
  code: string;
  expiresAt: string;
  status: FolderInviteStatus;
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
  createdAt: string;
  updatedAt: string;
}

export type FolderActivityType = "LINK_ADDED" | "MEMBER_JOINED" | "MEMBER_LEFT" | "MEMBER_KICKED";

export interface ActivityPerson {
  id: string | null;
  nickname: string;
  avatarUrl: string | null;
  avatarType?: CoverType | null;
  avatarValue?: string | null;
}

export interface FolderActivity {
  id: string;
  type: FolderActivityType;
  actor: ActivityPerson;
  targetName: string | null;
  targetUser: ActivityPerson | null;
  createdAt: string;
}
