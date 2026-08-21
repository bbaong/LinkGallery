import type { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, message: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendFail(res: Response, statusCode: number, message: string, code: string) {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}
