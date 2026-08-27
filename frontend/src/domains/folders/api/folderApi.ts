import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { Folder, FolderInvite } from "../types";
import type { FolderFormValues } from "../schema/folderSchema";

export interface UploadedImage {
  url: string;
  key: string;
}

export const folderApi = {
  async list() {
    const res = await apiClient.get<ApiSuccessResponse<Folder[]>>("/folders");
    return res.data.data;
  },

  async get(folderId: string) {
    const res = await apiClient.get<ApiSuccessResponse<Folder>>(`/folders/${folderId}`);
    return res.data.data;
  },

  async create(input: FolderFormValues) {
    const res = await apiClient.post<ApiSuccessResponse<Folder>>("/folders", input);
    return res.data.data;
  },

  async update(folderId: string, input: Partial<FolderFormValues>) {
    const res = await apiClient.patch<ApiSuccessResponse<Folder>>(`/folders/${folderId}`, input);
    return res.data.data;
  },

  async remove(folderId: string) {
    await apiClient.delete(`/folders/${folderId}`);
  },

  async getInvite(folderId: string) {
    const res = await apiClient.get<ApiSuccessResponse<FolderInvite | null>>(`/folders/${folderId}/invite`);
    return res.data.data;
  },

  async getOrCreateInvite(folderId: string) {
    const res = await apiClient.post<ApiSuccessResponse<FolderInvite>>(`/folders/${folderId}/invite`);
    return res.data.data;
  },

  async regenerateInvite(folderId: string) {
    const res = await apiClient.post<ApiSuccessResponse<FolderInvite>>(`/folders/${folderId}/invite/regenerate`);
    return res.data.data;
  },

  async revokeInvite(folderId: string) {
    await apiClient.delete(`/folders/${folderId}/invite`);
  },

  async join(code: string) {
    const res = await apiClient.post<ApiSuccessResponse<Folder>>("/folders/join", { code });
    return { folder: res.data.data, message: res.data.message };
  },

  async leave(folderId: string) {
    await apiClient.delete(`/folders/${folderId}/members/me`);
  },

  async removeMember(folderId: string, userId: string) {
    await apiClient.delete(`/folders/${folderId}/members/${userId}`);
  },

  async uploadCover(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<ApiSuccessResponse<UploadedImage>>(
      "/uploads/folder-cover",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  async deleteCover(url: string) {
    await apiClient.delete("/uploads/folder-cover", { data: { url } });
  },
};
