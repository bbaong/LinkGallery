import { ApiError } from "./ApiError";

export function requireParam(params: Record<string, string | string[] | undefined>, name: string): string {
  const value = params[name];
  if (!value || Array.isArray(value)) {
    throw ApiError.badRequest("요청 경로가 올바르지 않습니다.");
  }
  return value;
}
