export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    usernameAvailable: (username: string) => ["auth", "username-available", username] as const,
  },
  folders: {
    all: ["folders"] as const,
    detail: (folderId: string) => ["folders", folderId] as const,
    invite: (folderId: string) => ["folders", folderId, "invite"] as const,
  },
  links: {
    byFolder: (folderId: string) => ["links", "folder", folderId] as const,
    recent: (limit: number) => ["links", "recent", limit] as const,
    all: ["links", "all"] as const,
  },
};
