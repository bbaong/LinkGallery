import { apiClient } from "../../../shared/api/client";
import type { ApiSuccessResponse } from "../../../shared/api/types";
import type { User } from "../types";
import type { LoginFormValues, SignupFormValues, UpdateEmailFormValues } from "../schema/authSchema";

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

  async updateProfile(input: UpdateEmailFormValues) {
    const res = await apiClient.patch<ApiSuccessResponse<User>>("/auth/me", input);
    return res.data.data;
  },
};
