import { prisma } from "../../config/prisma";
import type { CreateFolderInput, UpdateFolderInput } from "./folder.schema";

const memberUserSelect = {
  id: true,
  nickname: true,
  avatarUrl: true,
  avatarType: true,
  avatarValue: true,
} as const;

const folderDetailInclude = {
  user: { select: memberUserSelect },
  members: {
    include: { user: { select: memberUserSelect } },
    orderBy: { joinedAt: "asc" as const },
  },
  _count: { select: { links: true, members: true } },
};

export const folderRepository = {
  findManyAccessible(userId: string) {
    return prisma.folder.findMany({
      where: {
        OR: [{ userId }, { members: { some: { userId } } }],
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

  findByInviteCode(code: string) {
    return prisma.folder.findUnique({
      where: { inviteCode: code },
      include: folderDetailInclude,
    });
  },

  findAccessibleFolderIds(userId: string) {
    return prisma.folder.findMany({
      where: {
        OR: [{ userId }, { members: { some: { userId } } }],
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
          create: { userId, role: "OWNER" },
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

  updateInviteCode(id: string, inviteCode: string) {
    return prisma.folder.update({
      where: { id },
      data: { inviteCode },
      include: folderDetailInclude,
    });
  },

  delete(id: string) {
    return prisma.folder.delete({ where: { id } });
  },

  addMember(folderId: string, userId: string, role: "OWNER" | "EDITOR") {
    return prisma.folderMember.create({
      data: { folderId, userId, role },
    });
  },

  ensureOwnerMember(folderId: string, userId: string) {
    return prisma.folderMember.upsert({
      where: { folderId_userId: { folderId, userId } },
      update: { role: "OWNER" },
      create: { folderId, userId, role: "OWNER" },
    });
  },
};
