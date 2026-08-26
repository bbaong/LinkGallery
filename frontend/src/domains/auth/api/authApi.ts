import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { User } from "../types";
import type { LoginFormValues, SignupFormValues } from "../schema/authSchema";

export type UpdateProfileInput = {
  nickname?: string;
  email?: string;
  avatarUrl?: string | null;
  avatarType?: "SOLID" | "GRADIENT" | "IMAGE" | null;
  avatarValue?: string | null;
  bannerType?: "SOLID" | "GRADIENT" | "IMAGE";
  bannerValue?: string;
};

export interface UploadedAvatar {
  url: string;
  key: string;
}

export const authApi = {
  async signup(input: SignupFormValues) {
    const res = await apiClient.post<ApiSuccessResponse<User>>("/auth/signup", input);
    return res.data.data;
  },

  async login(input: LoginFormValues) {
    const res = await apiClient.post<ApiSuccessResponse<User>>("/auth/login", input);
    return res.data.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async google(input: { idToken: string }) {
    const res = await apiClient.post<ApiSuccessResponse<User>>("/auth/google", input);
    return res.data.data;
  },

  async me() {
    const res = await apiClient.get<ApiSuccessResponse<User>>("/auth/me");
    return res.data.data;
  },

  async checkUsername(username: string) {
    const res = await apiClient.get<ApiSuccessResponse<{ available: boolean }>>("/auth/username-available", {
      params: { username },
    });
    return res.data.data;
  },

  async updateProfile(input: UpdateProfileInput) {
    const res = await apiClient.patch<ApiSuccessResponse<User>>("/auth/me", input);
    return res.data.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<ApiSuccessResponse<UploadedAvatar>>("/uploads/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async uploadBanner(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<ApiSuccessResponse<UploadedAvatar>>("/uploads/banner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async changePassword(input: {
    username: string;
    currentPassword: string;
    password: string;
    passwordConfirm: string;
  }) {
    await apiClient.post("/auth/me/password", input);
  },

  async resetWorkspace(input: { username: string }) {
    const res = await apiClient.post<ApiSuccessResponse<User>>("/auth/me/reset", input);
    return res.data.data;
  },

  async deleteAccount(input: { username: string; currentPassword?: string }) {
    await apiClient.delete("/auth/me", { data: input });
  },
};
