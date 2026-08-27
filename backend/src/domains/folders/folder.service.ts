import { folderRepository } from "./folder.repository";
import { generateInviteCode, normalizeInviteCode } from "./inviteCode";
import { ACTIVITY_LIST_LIMIT, INVITE_TTL_MS } from "./folder.constants";
import type { CreateFolderInput, UpdateFolderInput } from "./folder.schema";
import { userRepository } from "../users/user.repository";
import { ApiError } from "../../shared/ApiError";

type FolderRecord = NonNullable<Awaited<ReturnType<typeof folderRepository.findById>>>;
type InviteRecord = NonNullable<Awaited<ReturnType<typeof folderRepository.findInviteByCode>>>;
export type FolderRole = "OWNER" | "EDITOR";
export type FolderInviteStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

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

function memberUserOf(folder: FolderRecord, userId: string) {
  if (folder.user.id === userId) return folder.user;
  return folder.members.find((member) => member.userId === userId)?.user ?? null;
}

type ActivityRecord = Awaited<ReturnType<typeof folderRepository.listActivities>>[number];

function toActivityPerson(
  user: ActivityRecord["actor"],
  fallbackId: string | null,
  fallbackNickname: string
) {
  if (user) return toPublicUser(user);
  return {
    id: fallbackId,
    nickname: fallbackNickname,
    avatarUrl: null,
    avatarType: null,
    avatarValue: null,
  };
}

function toActivityDto(activity: ActivityRecord) {
  const targetNickname = activity.targetUser?.nickname ?? activity.targetNickname;
  return {
    id: activity.id,
    type: activity.type,
    actor: toActivityPerson(activity.actor, activity.actorUserId, activity.actorNickname),
    targetName: activity.targetName,
    targetUser:
      activity.type === "MEMBER_KICKED"
        ? toActivityPerson(activity.targetUser, activity.targetUserId, targetNickname ?? "")
        : null,
    createdAt: activity.createdAt,
  };
}

function inviteStatus(invite: InviteRecord): FolderInviteStatus {
  if (invite.revokedAt) return "REVOKED";
  if (invite.expiresAt.getTime() <= Date.now()) return "EXPIRED";
  return "ACTIVE";
}

function toInviteDto(invite: InviteRecord) {
  return {
    code: invite.code,
    expiresAt: invite.expiresAt,
    status: inviteStatus(invite),
  };
}

function toFolderDto(
  folder: FolderRecord,
  userId: string,
  options?: { includeMembers?: boolean }
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

async function createUniqueInvite(folderId: string, createdByUserId: string) {
  await folderRepository.revokeOpenInvites(folderId);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateInviteCode();
    const existing = await folderRepository.findInviteByCode(code);
    if (existing) continue;
    try {
      return await folderRepository.createInvite(folderId, createdByUserId, code, expiresAt);
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
    return toFolderDto(folder, userId, { includeMembers: true });
  },

  async createFolder(userId: string, input: CreateFolderInput) {
    const count = await folderRepository.countByUser(userId);
    const folder = await folderRepository.create(userId, input, count);
    return toFolderDto(folder, userId);
  },

  async updateFolder(userId: string, folderId: string, input: UpdateFolderInput) {
    await requireFolderOwner(userId, folderId);
    const updated = await folderRepository.update(folderId, input);
    return toFolderDto(updated, userId, { includeMembers: true });
  },

  async deleteFolder(userId: string, folderId: string) {
    await requireFolderOwner(userId, folderId);
    await folderRepository.delete(folderId);
  },

  async getInvite(userId: string, folderId: string) {
    await requireFolderOwner(userId, folderId);
    const latest = await folderRepository.findLatestInvite(folderId);
    if (!latest || latest.revokedAt) return null;
    return toInviteDto(latest);
  },

  async getOrCreateInviteCode(userId: string, folderId: string) {
    await requireFolderOwner(userId, folderId);
    await folderRepository.ensureOwnerMember(folderId, userId);
    const active = await folderRepository.findActiveInvite(folderId);
    if (active) return toInviteDto(active);
    const created = await createUniqueInvite(folderId, userId);
    return toInviteDto(created);
  },

  async regenerateInviteCode(userId: string, folderId: string) {
    await requireFolderOwner(userId, folderId);
    await folderRepository.ensureOwnerMember(folderId, userId);
    const created = await createUniqueInvite(folderId, userId);
    return toInviteDto(created);
  },

  async revokeInvite(userId: string, folderId: string) {
    await requireFolderOwner(userId, folderId);
    await folderRepository.revokeOpenInvites(folderId);
  },

  async joinByCode(userId: string, rawCode: string) {
    const code = normalizeInviteCode(rawCode);
    if (code.length !== 6) {
      throw ApiError.badRequest("초대 코드를 확인해주세요.", "INVITE_INVALID");
    }

    const invite = await folderRepository.findInviteByCode(code);
    if (!invite) {
      throw ApiError.badRequest("초대 코드를 확인해주세요.", "INVITE_INVALID");
    }
    if (invite.revokedAt) {
      throw ApiError.badRequest("이 초대 코드는 더 이상 사용할 수 없어요.", "INVITE_REVOKED");
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      throw ApiError.badRequest("이 초대 코드는 만료되었어요.", "INVITE_EXPIRED");
    }

    const folder = await folderRepository.findById(invite.folderId);
    if (!folder) {
      throw ApiError.badRequest("초대 코드를 확인해주세요.", "INVITE_INVALID");
    }

    if (folder.userId === userId || resolveRole(folder, userId)) {
      throw ApiError.conflict("이미 참여하고 있는 폴더예요.");
    }

    const existing = await folderRepository.findMember(invite.folderId, userId);
    if (existing?.status === "ACTIVE") {
      throw ApiError.conflict("이미 참여하고 있는 폴더예요.");
    }
    if (existing?.status === "KICKED") {
      throw ApiError.forbidden("이 폴더에 다시 참여할 수 없어요.", "MEMBERSHIP_KICKED");
    }

    const joiningUser = await userRepository.findById(userId);
    if (!joiningUser) {
      throw ApiError.unauthorized();
    }

    if (existing?.status === "LEFT") {
      if (existing.lastJoinedInviteId === invite.id) {
        throw ApiError.forbidden("이 초대 코드로는 다시 참여할 수 없어요.", "INVITE_ALREADY_USED");
      }
      await folderRepository.reactivateMemberWithJoinActivity(
        invite.folderId,
        userId,
        invite.id,
        joiningUser.nickname
      );
    } else {
      try {
        await folderRepository.addMemberWithJoinActivity(
          invite.folderId,
          userId,
          invite.id,
          joiningUser.nickname
        );
      } catch (error) {
        const candidate = error as { code?: string };
        if (candidate.code === "P2002") {
          throw ApiError.conflict("이미 참여하고 있는 폴더예요.");
        }
        throw error;
      }
    }

    const joined = await folderRepository.findById(invite.folderId);
    if (!joined) {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }
    const dto = toFolderDto(joined, userId, { includeMembers: true });
    if (!dto) {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }
    return dto;
  },

  async removeMember(actorUserId: string, folderId: string, targetUserId: string) {
    const { folder } = await requireFolderOwner(actorUserId, folderId);

    if (targetUserId === actorUserId || folder.userId === targetUserId) {
      throw ApiError.forbidden("폴더 소유자는 내보낼 수 없어요.");
    }

    const target = folder.members.find((member) => member.userId === targetUserId);
    if (!target) {
      throw ApiError.notFound("멤버를 찾을 수 없습니다.");
    }
    if (target.role === "OWNER") {
      throw ApiError.forbidden("폴더 소유자는 내보낼 수 없어요.");
    }

    await folderRepository.markMemberLeftWithActivity(folderId, targetUserId, "KICKED", {
      actorUserId,
      actorNickname: folder.user.nickname,
      targetNickname: target.user.nickname,
    });
  },

  async leaveFolder(userId: string, folderId: string) {
    const { folder, role } = await requireFolderMember(userId, folderId);
    if (role === "OWNER") {
      throw ApiError.forbidden("폴더 소유자는 나갈 수 없어요.");
    }

    const existing = await folderRepository.findMember(folderId, userId);
    if (!existing || existing.status !== "ACTIVE") {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }

    const actor = memberUserOf(folder, userId);
    await folderRepository.markMemberLeftWithActivity(folderId, userId, "LEFT", {
      actorUserId: userId,
      actorNickname: actor?.nickname ?? "",
    });
  },

  async listActivities(userId: string, folderId: string, limit = ACTIVITY_LIST_LIMIT) {
    await requireFolderMember(userId, folderId);
    const activities = await folderRepository.listActivities(
      folderId,
      Math.min(limit, ACTIVITY_LIST_LIMIT)
    );
    return { activities: activities.map(toActivityDto) };
  },
};
