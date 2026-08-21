import type { Request, Response } from "express";
import path from "node:path";
import { localImageStorageService } from "../../shared/storage/localImageStorageService";
import { deleteFolderCoverSchema } from "./upload.schema";
import { sendSuccess } from "../../shared/response";
import { ApiError } from "../../shared/ApiError";

export const uploadController = {
  async uploadFolderCover(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      throw ApiError.badRequest("업로드할 이미지를 선택해주세요.");
    }

    const stored = await localImageStorageService.save(file);
    sendSuccess(res, stored, "이미지가 업로드되었습니다.", 201);
  },

  async deleteFolderCover(req: Request, res: Response) {
    const { url } = deleteFolderCoverSchema.parse(req.body);
    const key = path.basename(url);
    await localImageStorageService.remove(key);
    sendSuccess(res, null, "이미지가 삭제되었습니다.");
  },
};
