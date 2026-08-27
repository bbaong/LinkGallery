import axios from "axios";
import { clearClientSession } from "./clearClientSession";
import type { ApiErrorResponse } from "./types";

export class ApiRequestError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
      const { message, code } = error.response.data;
      if (code === "UNAUTHORIZED") {
        clearClientSession();
      }
      return Promise.reject(new ApiRequestError(message, code));
    }
    return Promise.reject(new ApiRequestError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "NETWORK_ERROR"));
  }
);
