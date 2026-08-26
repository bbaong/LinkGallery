import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { Link, RecentLink } from "../types";
import type { LinkFormValues } from "../schema/linkSchema";

export const linkApi = {
  async listByFolder(folderId: string, search?: string) {
    const res = await apiClient.get<ApiSuccessResponse<Link[]>>(`/folders/${folderId}/links`, {
      params: search ? { search } : undefined,
    });
    return res.data.data;
  },

  async listRecent(limit = 12) {
    const res = await apiClient.get<ApiSuccessResponse<RecentLink[]>>("/links/recent", {
      params: { limit },
    });
    return res.data.data;
  },

  async listAll(limit = 200) {
    const res = await apiClient.get<ApiSuccessResponse<RecentLink[]>>("/links", {
      params: { limit },
    });
    return res.data.data;
  },

  async create(folderId: string, input: LinkFormValues) {
    const res = await apiClient.post<ApiSuccessResponse<Link>>("/links", {
      folderId,
      ...input,
      category: input.category?.trim() ? input.category.trim() : null,
    });
    return res.data.data;
  },

  async update(linkId: string, input: Partial<LinkFormValues>) {
    const res = await apiClient.patch<ApiSuccessResponse<Link>>(`/links/${linkId}`, {
      ...input,
      ...(input.category !== undefined
        ? { category: input.category.trim() ? input.category.trim() : null }
        : {}),
    });
    return res.data.data;
  },

  async reorder(folderId: string, orderedIds: string[]) {
    const res = await apiClient.patch<ApiSuccessResponse<Link[]>>("/links/reorder", {
      folderId,
      orderedIds,
    });
    return res.data.data;
  },

  async recordVisit(linkId: string) {
    const res = await apiClient.post<ApiSuccessResponse<Link>>(`/links/${linkId}/visit`);
    return res.data.data;
  },

  async refreshPreview(linkId: string) {
    const res = await apiClient.post<ApiSuccessResponse<Link>>(`/links/${linkId}/preview`);
    return res.data.data;
  },

  async remove(linkId: string) {
    await apiClient.delete(`/links/${linkId}`);
  },
};
