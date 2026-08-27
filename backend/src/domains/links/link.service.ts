import { linkRepository } from "./link.repository";
import { folderRepository } from "../folders/folder.repository";
import { requireFolderMember } from "../folders/folder.service";
import { normalizeUrl } from "./link.util";
import { fetchLinkPreviewImage } from "./link.preview";
import type { CreateLinkInput, ReorderLinksInput, UpdateLinkInput } from "./link.schema";
import { ApiError } from "../../shared/ApiError";

type LinkWithCreator = Awaited<ReturnType<typeof linkRepository.findManyByFolder>>[number];

function toLinkDto(link: LinkWithCreator) {
  const { user, ...rest } = link;
  return {
    ...rest,
    createdBy: user
      ? {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          avatarType: user.avatarType,
          avatarValue: user.avatarValue,
        }
      : null,
  };
}

function isUniqueConstraintError(error: unknown, field: string) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; meta?: { target?: string | string[] } };
  if (candidate.code !== "P2002") return false;
  const target = candidate.meta?.target;
  if (typeof target === "string") return target.includes(field);
  if (Array.isArray(target)) return target.includes(field);
  return false;
}

async function requireLinkFolderAccess(userId: string, linkId: string) {
  const existing = await linkRepository.findById(linkId);
  if (!existing) {
    throw ApiError.notFound("링크를 찾을 수 없습니다.");
  }
  await requireFolderMember(userId, existing.folderId);
  return existing;
}

async function accessibleFolderIds(userId: string) {
  const folders = await folderRepository.findAccessibleFolderIds(userId);
  return folders.map((folder) => folder.id);
}

export const linkService = {
  async listByFolder(userId: string, folderId: string, search?: string) {
    await requireFolderMember(userId, folderId);
    return (await linkRepository.findManyByFolder(folderId, search)).map(toLinkDto);
  },

  async listRecent(userId: string, limit = 12) {
    const folderIds = await accessibleFolderIds(userId);
    return linkRepository.findRecentByFolderIds(folderIds, limit);
  },

  async listAll(userId: string, limit = 200) {
    const folderIds = await accessibleFolderIds(userId);
    return linkRepository.findManyByFolderIds(folderIds, limit);
  },

  async createLink(userId: string, input: CreateLinkInput) {
    const { folder } = await requireFolderMember(userId, input.folderId);

    const normalized = normalizeUrl(input.url);
    const title = input.title && input.title.length > 0 ? input.title : normalized.domain;
    const actor = folder.user.id === userId ? folder.user : folder.members.find((member) => member.userId === userId)?.user;

    const duplicate = await linkRepository.findDuplicate(input.folderId, normalized.urlHash);
    if (duplicate) {
      throw ApiError.conflict("이미 저장된 URL입니다.");
    }

    const count = await linkRepository.countByFolder(input.folderId);
    try {
      const created = await linkRepository.createWithActivity(
        userId,
        input.folderId,
        normalized,
        title,
        input.description,
        count,
        input.category ?? null,
        actor?.nickname ?? ""
      );
      const previewImageUrl = await fetchLinkPreviewImage(normalized.url);
      if (!previewImageUrl) return toLinkDto(created);
      return toLinkDto(await linkRepository.update(created.id, { previewImageUrl }));
    } catch (error) {
      if (isUniqueConstraintError(error, "urlHash")) {
        throw ApiError.conflict("이미 저장된 URL입니다.");
      }
      throw error;
    }
  },

  async updateLink(userId: string, linkId: string, input: UpdateLinkInput) {
    const existing = await requireLinkFolderAccess(userId, linkId);

    const data: {
      url?: string;
      urlHash?: string;
      faviconUrl?: string;
      previewImageUrl?: string | null;
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
      data.previewImageUrl = await fetchLinkPreviewImage(normalized.url);

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
      return toLinkDto(await linkRepository.update(linkId, data));
    } catch (error) {
      if (isUniqueConstraintError(error, "urlHash")) {
        throw ApiError.conflict("이미 저장된 URL입니다.");
      }
      throw error;
    }
  },

  async recordVisit(userId: string, linkId: string) {
    await requireLinkFolderAccess(userId, linkId);
    return linkRepository.markVisited(linkId);
  },

  async refreshPreview(userId: string, linkId: string) {
    const existing = await requireLinkFolderAccess(userId, linkId);
    const previewImageUrl = await fetchLinkPreviewImage(existing.url);
    return toLinkDto(await linkRepository.update(linkId, { previewImageUrl }));
  },

  async reorderLinks(userId: string, input: ReorderLinksInput) {
    await requireFolderMember(userId, input.folderId);
    const links = await linkRepository.findManyByFolder(input.folderId);
    const currentIds = new Set(links.map((link) => link.id));

    if (
      input.orderedIds.length !== links.length ||
      new Set(input.orderedIds).size !== input.orderedIds.length ||
      input.orderedIds.some((id) => !currentIds.has(id))
    ) {
      throw ApiError.badRequest("링크 순서가 올바르지 않습니다.");
    }

    await linkRepository.updatePositions(input.orderedIds.map((id, position) => ({ id, position })));
    return (await linkRepository.findManyByFolder(input.folderId)).map(toLinkDto);
  },

  async deleteLink(userId: string, linkId: string) {
    await requireLinkFolderAccess(userId, linkId);
    await linkRepository.delete(linkId);
  },
};
