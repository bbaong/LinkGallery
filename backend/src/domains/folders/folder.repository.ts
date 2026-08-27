import { prisma } from "../../config/prisma";
import type { CreateFolderInput, UpdateFolderInput } from "./folder.schema";

const memberUserSelect = {
  id: true,
  nickname: true,
  avatarUrl: true,
  avatarType: true,
  avatarValue: true,
} as const;

const activeMemberWhere = { status: "ACTIVE" as const };

const folderDetailInclude = {
  user: { select: memberUserSelect },
  members: {
    where: activeMemberWhere,
    include: { user: { select: memberUserSelect } },
    orderBy: { joinedAt: "asc" as const },
  },
  _count: {
    select: {
      links: true,
      members: { where: activeMemberWhere },
    },
  },
};

export const folderRepository = {
  findManyAccessible(userId: string) {
    return prisma.folder.findMany({
      where: {
        OR: [{ userId }, { members: { some: { userId, status: "ACTIVE" } } }],
      },
      include: folderDetailInclude,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  },

  findById(id: string) {
    return prisma.folder.findUnique({
      where: { id },
      include: folderDetailInclude,
    });
  },

  findAccessibleFolderIds(userId: string) {
    return prisma.folder.findMany({
      where: {
        OR: [{ userId }, { members: { some: { userId, status: "ACTIVE" } } }],
      },
      select: { id: true },
    });
  },

  async countByUser(userId: string) {
    return prisma.folder.count({ where: { userId } });
  },

  async create(userId: string, input: CreateFolderInput, position: number) {
    return prisma.folder.create({
      data: {
        userId,
        name: input.name,
        icon: input.icon ?? null,
        coverType: input.coverType,
        coverValue: input.coverValue,
        position,
        members: {
          create: { userId, role: "OWNER", status: "ACTIVE" },
        },
      },
      include: folderDetailInclude,
    });
  },

  update(id: string, input: UpdateFolderInput) {
    return prisma.folder.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.coverType !== undefined ? { coverType: input.coverType } : {}),
        ...(input.coverValue !== undefined ? { coverValue: input.coverValue } : {}),
      },
      include: folderDetailInclude,
    });
  },

  delete(id: string) {
    return prisma.folder.delete({ where: { id } });
  },

  findMember(folderId: string, userId: string) {
    return prisma.folderMember.findUnique({
      where: { folderId_userId: { folderId, userId } },
    });
  },

  addMember(folderId: string, userId: string, role: "OWNER" | "EDITOR", lastJoinedInviteId?: string) {
    return prisma.folderMember.create({
      data: {
        folderId,
        userId,
        role,
        status: "ACTIVE",
        lastJoinedInviteId: lastJoinedInviteId ?? null,
      },
    });
  },

  reactivateMember(folderId: string, userId: string, lastJoinedInviteId: string) {
    return prisma.folderMember.update({
      where: { folderId_userId: { folderId, userId } },
      data: {
        status: "ACTIVE",
        role: "EDITOR",
        leftAt: null,
        lastJoinedInviteId,
      },
    });
  },

  ensureOwnerMember(folderId: string, userId: string) {
    return prisma.folderMember.upsert({
      where: { folderId_userId: { folderId, userId } },
      update: { role: "OWNER", status: "ACTIVE", leftAt: null },
      create: { folderId, userId, role: "OWNER", status: "ACTIVE" },
    });
  },

  markMemberLeft(folderId: string, userId: string, status: "LEFT" | "KICKED") {
    return prisma.folderMember.update({
      where: { folderId_userId: { folderId, userId } },
      data: { status, leftAt: new Date() },
    });
  },

  findInviteByCode(code: string) {
    return prisma.folderInvite.findUnique({
      where: { code },
    });
  },

  findLatestInvite(folderId: string) {
    return prisma.folderInvite.findFirst({
      where: { folderId },
      orderBy: { createdAt: "desc" },
    });
  },

  findActiveInvite(folderId: string) {
    return prisma.folderInvite.findFirst({
      where: {
        folderId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  revokeOpenInvites(folderId: string) {
    return prisma.folderInvite.updateMany({
      where: { folderId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  createInvite(folderId: string, createdByUserId: string, code: string, expiresAt: Date) {
    return prisma.folderInvite.create({
      data: { folderId, createdByUserId, code, expiresAt },
    });
  },
};
