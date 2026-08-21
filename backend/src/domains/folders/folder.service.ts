import { folderRepository } from "./folder.repository";
import type { CreateFolderInput, UpdateFolderInput } from "./folder.schema";
import { ApiError } from "../../shared/ApiError";

function toFolderDto(folder: Awaited<ReturnType<typeof folderRepository.findByIdAndUser>>) {
  if (!folder) return null;
  const { _count, ...rest } = folder;
  return { ...rest, linkCount: _count.links };
}

export const folderService = {
  async listFolders(userId: string) {
    const folders = await folderRepository.findManyByUser(userId);
    return folders.map((folder) => toFolderDto(folder));
  },

  async getFolder(userId: string, folderId: string) {
    const folder = await folderRepository.findByIdAndUser(folderId, userId);
    if (!folder) {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }
    return toFolderDto(folder);
  },

  async createFolder(userId: string, input: CreateFolderInput) {
    const count = await folderRepository.countByUser(userId);
    const folder = await folderRepository.create(userId, input, count);
    return toFolderDto(folder);
  },

  async updateFolder(userId: string, folderId: string, input: UpdateFolderInput) {
    const existing = await folderRepository.findByIdAndUser(folderId, userId);
    if (!existing) {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }
    const updated = await folderRepository.update(folderId, input);
    return toFolderDto(updated);
  },

  async deleteFolder(userId: string, folderId: string) {
    const existing = await folderRepository.findByIdAndUser(folderId, userId);
    if (!existing) {
      throw ApiError.notFound("폴더를 찾을 수 없습니다.");
    }
    await folderRepository.delete(folderId);
  },
};
