import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { ApiError } from "../shared/ApiError";
import { sendFail } from "../shared/response";
import { isProduction } from "../config/env";

export function notFoundHandler(_req: Request, res: Response) {
  sendFail(res, 404, "요청한 API를 찾을 수 없습니다.", "NOT_FOUND");
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    sendFail(res, err.statusCode, err.message, err.code);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
    sendFail(res, 400, message, "VALIDATION_ERROR");
    return;
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "이미지 크기는 5MB 이하만 업로드할 수 있습니다." : "이미지 업로드에 실패했습니다.";
    sendFail(res, 400, message, "UPLOAD_ERROR");
    return;
  }

  if (typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "P2000") {
    sendFail(res, 400, "입력값이 너무 깁니다.", "VALUE_TOO_LONG");
    return;
  }

  if (!isProduction) {
    console.error(err);
  }

  sendFail(res, 500, "요청을 처리할 수 없습니다.", "INTERNAL_ERROR");
}
