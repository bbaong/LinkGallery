import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../shared/constants";
import { verifyAuthToken } from "../domains/auth/jwt";
import { ApiError } from "../shared/ApiError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    throw ApiError.unauthorized();
  }

  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    throw ApiError.unauthorized("인증이 만료되었습니다. 다시 로그인해주세요.");
  }
}
