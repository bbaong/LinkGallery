import { prisma } from "../../config/prisma";
import type { NormalizedUrl } from "./link.util";

export const linkRepository = {
  findManyByFolder(userId: string, folderId: string, search?: string) {
    return prisma.link.findMany({
      where: {
        userId,
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
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  },

  findRecentByUser(userId: string, limit: number) {
    return prisma.link.findMany({
      where: { userId, lastVisitedAt: { not: null } },
      orderBy: { lastVisitedAt: "desc" },
      take: limit,
      include: { folder: { select: { id: true, name: true, icon: true } } },
    });
  },

  findManyByUser(userId: string, limit: number) {
    return prisma.link.findMany({
      where: { userId },
      orderBy: [{ lastVisitedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: { folder: { select: { id: true, name: true, icon: true } } },
    });
  },

  findByIdAndUser(id: string, userId: string) {
    return prisma.link.findFirst({ where: { id, userId } });
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
    });
  },

  update(
    id: string,
    data: {
      url?: string;
      urlHash?: string;
      faviconUrl?: string;
      title?: string;
      description?: string;
      category?: string | null;
    }
  ) {
    return prisma.link.update({ where: { id }, data });
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
