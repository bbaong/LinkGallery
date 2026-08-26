import { folderRepository } from "./folder.repository";
import { generateInviteCode, normalizeInviteCode } from "./inviteCode";
import type { CreateFolderInput, UpdateFolderInput } from "./folder.schema";
import { ApiError } from "../../shared/ApiError";

type FolderRecord = NonNullable<Awaited<ReturnType<typeof folderRepository.findById>>>;
export type FolderRole = "OWNER" | "EDITOR";

function memberCountOf(folder: FolderRecord) {
  return Math.max(folder._count.members, folder.members.length, 1);
}

function resolveRole(folder: FolderRecord, userId: string): FolderRole | null {
  if (folder.userId === userId) return "OWNER";
  const member = folder.members.find((item) => item.userId === userId);
  return member?.role ?? null;
}

function toPublicUser(user: FolderRecord["user"]) {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    avatarType: user.avatarType,
    avatarValue: user.avatarValue,
  };
}

function toFolderDto(
  folder: FolderRecord,
  userId: string,
  options?: { includeInvite?: boolean; includeMembers?: boolean }
) {
  const myRole = resolveRole(folder, userId);
  if (!myRole) return null;

  return {
    id: folder.id,
    userId: folder.userId,
    name: folder.name,
    icon: folder.icon,
    coverType: folder.coverType,
    coverValue: folder.coverValue,
    position: folder.position,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
    linkCount: folder._count.links,
    myRole,
    memberCount: memberCountOf(folder),
    owner: toPublicUser(folder.user),
    members: options?.includeMembers
      ? folder.members.map((member) => ({
          ...toPublicUser(member.user),
          role: member.role,
        }))
      : undefined,
    inviteCode: options?.includeInvite && myRole === "OWNER" ? folder.inviteCode : undefined,
  };
}

export async function requireFolderMember(userId: string, folderId: string) {
  const folder = await folderRepository.findById(folderId);
  if (!folder) {
    throw ApiError.notFound("폴더를 찾을 수 없습니다.");
  }
  const role = resolveRole(folder, userId);
  if (!role) {
    throw ApiError.notFound("폴더를 찾을 수 없습니다.");
  }
  return { folder, role };
}

export async function requireFolderOwner(userId: string, folderId: string) {
  const access = await requireFolderMember(userId, folderId);
  if (access.role !== "OWNER") {
    throw ApiError.forbidden("폴더 소유자만 할 수 있어요.");
  }
  return access;
}

async function assignUniqueInviteCode(folderId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateInviteCode();
    const existing = await folderRepository.findByInviteCode(code);
    if (existing) continue;
    try {
      return await folderRepository.updateInviteCode(folderId, code);
    } catch (error) {
      const candidate = error as { code?: string };
      if (candidate.code === "P2002") continue;
      throw error;
    }
  }
  throw ApiError.internal("초대 코드를 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
}

export const folderService = {
  async listFolders(userId: string) {
    const folders = await folderRepository.findManyAccessible(userId);
    return folders
      .map((folder) => toFolderDto(folder, userId))
      .filter((folder): folder is NonNullable<typeof folder> => Boolean(folder));
  },

  async getFolder(userId: string, folderId: string) {
    const { folder } = await requireFolderMember(userId, folderId);
    return toFolderDto(folder, userId, { includeInvite: true, includeMembers: true });
  },

  async createFolder(userId: string, input: CreateFolderInput) {
    const count = await folderRepository.countByUser(userId);
    const folder = await folderRepository.create(userId, input, count);
    return toFolderDto(folder, userId);
  },

  async updateFolder(userId: string, folderId: string, input: UpdateFolderInput) {
    await requireFolderOwner(userId, folderId);
    const updated = await folderRepository.update(folderId, input);
    return toFolderDto(updated, userId, { includeInvite: true, includeMembers: true });
  },

  async deleteFolder(userId: string, folderId: string) {
    await requireFolderOwner(userId, folderId);
    await folderRepository.delete(folderId);
  },

  async getOrCreateInviteCode(userId: string, folderId: string) {
    const { folder } = await requireFolderOwner(userId, folderId);
    await folderRepository.ensureOwnerMember(folderId, userId);
    if (folder.inviteCode) {
      return { code: folder.inviteCode, role: "EDITOR" as const };
    }
    const updated = await assignUniqueInviteCode(folderId);
    return { code: updated.inviteCode!, role: "EDITOR" as const };
  },

  async regenerateInviteCode(userId: string, folderId: string) {
    await requireFolderOwner(userId, folderId);
    const updated = await assignUniqueInviteCode(folderId);
    return { code: updated.inviteCode!, role: "EDITOR" as const };
  },

  async joinByCode(userId: string, rawCode: string) {
    const code = normalizeInviteCode(rawCode);
    if (code.length !== 6) {
      throw ApiError.badRequest("초대 코드를 확인해주세요.");
    }

    const folder = await folderRepository.findByInviteCode(code);
    if (!folder) {
      throw ApiError.badRequest("초대 코드를 확인해주세요.");
    }

    if (resolveRole(folder, userId)) {
      throw ApiError.conflict("이미 참여하고 있는 폴더예요.");
    }

    try {
      await folderRepository.addMember(folder.id, userId, "EDITOR");
    } catch (error) {
      const candidate = error as { code?: string };
      if (candidate.code === "P2002") {
        throw ApiError.conflict("이미 참여하고 있는 폴더예요.");
      }
      throw error;
    }

    const joined = await folderRepository.findById(folder.id);
    if (!joined) {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }
    const dto = toFolderDto(joined, userId, { includeMembers: true });
    if (!dto) {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }
    return dto;
  },
};
