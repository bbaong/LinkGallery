import { linkRepository } from "./link.repository";
import { folderRepository } from "../folders/folder.repository";
import { normalizeUrl } from "./link.util";
import type { CreateLinkInput, ReorderLinksInput, UpdateLinkInput } from "./link.schema";
import { ApiError } from "../../shared/ApiError";

function isUniqueConstraintError(error: unknown, field: string) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; meta?: { target?: string | string[] } };
  if (candidate.code !== "P2002") return false;
  const target = candidate.meta?.target;
  if (typeof target === "string") return target.includes(field);
  if (Array.isArray(target)) return target.includes(field);
  return false;
}

async function assertFolderOwnership(userId: string, folderId: string) {
  const folder = await folderRepository.findByIdAndUser(folderId, userId);
  if (!folder) {
    throw ApiError.notFound("폴더를 찾을 수 없습니다.");
  }
}

export const linkService = {
  async listByFolder(userId: string, folderId: string, search?: string) {
    await assertFolderOwnership(userId, folderId);
    return linkRepository.findManyByFolder(userId, folderId, search);
  },

  async listRecent(userId: string, limit = 12) {
    return linkRepository.findRecentByUser(userId, limit);
  },

  async listAll(userId: string, limit = 200) {
    return linkRepository.findManyByUser(userId, limit);
  },

  async createLink(userId: string, input: CreateLinkInput) {
    await assertFolderOwnership(userId, input.folderId);

    const normalized = normalizeUrl(input.url);
    const title = input.title && input.title.length > 0 ? input.title : normalized.domain;

    const duplicate = await linkRepository.findDuplicate(input.folderId, normalized.urlHash);
    if (duplicate) {
      throw ApiError.conflict("이미 저장된 URL입니다.");
    }

    const count = await linkRepository.countByFolder(input.folderId);
    try {
      return await linkRepository.create(
        userId,
        input.folderId,
        normalized,
        title,
        input.description,
        count,
        input.category ?? null
      );
    } catch (error) {
      if (isUniqueConstraintError(error, "urlHash")) {
        throw ApiError.conflict("이미 저장된 URL입니다.");
      }
      throw error;
    }
  },

  async updateLink(userId: string, linkId: string, input: UpdateLinkInput) {
    const existing = await linkRepository.findByIdAndUser(linkId, userId);
    if (!existing) {
      throw ApiError.notFound("링크를 찾을 수 없습니다.");
    }

    const data: {
      url?: string;
      urlHash?: string;
      faviconUrl?: string;
      title?: string;
      description?: string;
      category?: string | null;
    } = {};

    if (input.url !== undefined) {
      const normalized = normalizeUrl(input.url);
      const duplicate = await linkRepository.findDuplicate(existing.folderId, normalized.urlHash, linkId);
      if (duplicate) {
        throw ApiError.conflict("이미 저장된 URL입니다.");
      }
      data.url = normalized.url;
      data.urlHash = normalized.urlHash;
      data.faviconUrl = normalized.faviconUrl;

      if (input.title !== undefined) {
        data.title = input.title.length > 0 ? input.title : normalized.domain;
      }
    } else if (input.title !== undefined) {
      data.title = input.title.length > 0 ? input.title : existing.title;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.category !== undefined) {
      data.category = input.category;
    }

    try {
      return await linkRepository.update(linkId, data);
    } catch (error) {
      if (isUniqueConstraintError(error, "urlHash")) {
        throw ApiError.conflict("이미 저장된 URL입니다.");
      }
      throw error;
    }
  },

  async recordVisit(userId: string, linkId: string) {
    const existing = await linkRepository.findByIdAndUser(linkId, userId);
    if (!existing) {
      throw ApiError.notFound("링크를 찾을 수 없습니다.");
    }
    return linkRepository.markVisited(linkId);
  },

  async reorderLinks(userId: string, input: ReorderLinksInput) {
    await assertFolderOwnership(userId, input.folderId);
    const links = await linkRepository.findManyByFolder(userId, input.folderId);
    const currentIds = new Set(links.map((link) => link.id));

    if (
      input.orderedIds.length !== links.length ||
      new Set(input.orderedIds).size !== input.orderedIds.length ||
      input.orderedIds.some((id) => !currentIds.has(id))
    ) {
      throw ApiError.badRequest("링크 순서가 올바르지 않습니다.");
    }

    await linkRepository.updatePositions(input.orderedIds.map((id, position) => ({ id, position })));
    return linkRepository.findManyByFolder(userId, input.folderId);
  },

  async deleteLink(userId: string, linkId: string) {
    const existing = await linkRepository.findByIdAndUser(linkId, userId);
    if (!existing) {
      throw ApiError.notFound("링크를 찾을 수 없습니다.");
    }
    await linkRepository.delete(linkId);
  },
};
