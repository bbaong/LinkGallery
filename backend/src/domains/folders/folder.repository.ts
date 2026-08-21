import { prisma } from "../../config/prisma";
import type { CreateFolderInput, UpdateFolderInput } from "./folder.schema";

export const folderRepository = {
  findManyByUser(userId: string) {
    return prisma.folder.findMany({
      where: { userId },
      include: { _count: { select: { links: true } } },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  },

  findByIdAndUser(id: string, userId: string) {
    return prisma.folder.findFirst({
      where: { id, userId },
      include: { _count: { select: { links: true } } },
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
      },
      include: { _count: { select: { links: true } } },
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
      include: { _count: { select: { links: true } } },
    });
  },

  delete(id: string) {
    return prisma.folder.delete({ where: { id } });
  },
};
