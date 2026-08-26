import { prisma } from "../../config/prisma";
import type { NormalizedUrl } from "./link.util";

const creatorSelect = {
  user: {
    select: { id: true, nickname: true, avatarUrl: true, avatarType: true, avatarValue: true },
  },
} as const;

export const linkRepository = {
  findManyByFolder(folderId: string, search?: string) {
    return prisma.link.findMany({
      where: {
        folderId,
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
                { url: { contains: search } },
              ],
            }
          : {}),
      },
      include: creatorSelect,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  },

  findRecentByFolderIds(folderIds: string[], limit: number) {
    if (folderIds.length === 0) return Promise.resolve([]);
    return prisma.link.findMany({
      where: { folderId: { in: folderIds }, lastVisitedAt: { not: null } },
      orderBy: { lastVisitedAt: "desc" },
      take: limit,
      include: { folder: { select: { id: true, name: true, icon: true } } },
    });
  },

  findManyByFolderIds(folderIds: string[], limit: number) {
    if (folderIds.length === 0) return Promise.resolve([]);
    return prisma.link.findMany({
      where: { folderId: { in: folderIds } },
      orderBy: [{ lastVisitedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: { folder: { select: { id: true, name: true, icon: true } } },
    });
  },

  findById(id: string) {
    return prisma.link.findUnique({ where: { id } });
  },

  findDuplicate(folderId: string, urlHash: string, excludeId?: string) {
    return prisma.link.findFirst({
      where: { folderId, urlHash, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  },

  async countByFolder(folderId: string) {
    return prisma.link.count({ where: { folderId } });
  },

  create(
    userId: string,
    folderId: string,
    normalized: NormalizedUrl,
    title: string,
    description: string | undefined,
    position: number,
    category: string | null
  ) {
    return prisma.link.create({
      data: {
        userId,
        folderId,
        url: normalized.url,
        urlHash: normalized.urlHash,
        title,
        description: description ?? null,
        faviconUrl: normalized.faviconUrl,
        position,
        category,
      },
      include: creatorSelect,
    });
  },

  update(
    id: string,
    data: {
      url?: string;
      urlHash?: string;
      faviconUrl?: string;
      previewImageUrl?: string | null;
      title?: string;
      description?: string;
      category?: string | null;
    }
  ) {
    return prisma.link.update({ where: { id }, data, include: creatorSelect });
  },

  delete(id: string) {
    return prisma.link.delete({ where: { id } });
  },

  updatePositions(items: { id: string; position: number }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.link.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );
  },

  markVisited(id: string) {
    return prisma.link.update({
      where: { id },
      data: { lastVisitedAt: new Date() },
    });
  },
};
