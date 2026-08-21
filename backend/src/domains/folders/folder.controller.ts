import type { Request, Response } from "express";
import { folderService } from "./folder.service";
import { createFolderSchema, updateFolderSchema } from "./folder.schema";
import { linkService } from "../links/link.service";
import { listLinksQuerySchema } from "../links/link.schema";
import { sendSuccess } from "../../shared/response";
import { requireParam } from "../../shared/params";

export const folderController = {
  async list(req: Request, res: Response) {
    const folders = await folderService.listFolders(req.userId!);
    sendSuccess(res, folders, "폴더 목록을 조회했습니다.");
  },

  async detail(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const folder = await folderService.getFolder(req.userId!, folderId);
    sendSuccess(res, folder, "폴더를 조회했습니다.");
  },

  async create(req: Request, res: Response) {
    const input = createFolderSchema.parse(req.body);
    const folder = await folderService.createFolder(req.userId!, input);
    sendSuccess(res, folder, "폴더가 생성되었습니다.", 201);
  },

  async update(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const input = updateFolderSchema.parse(req.body);
    const folder = await folderService.updateFolder(req.userId!, folderId, input);
    sendSuccess(res, folder, "폴더가 수정되었습니다.");
  },

  async remove(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    await folderService.deleteFolder(req.userId!, folderId);
    sendSuccess(res, null, "폴더가 삭제되었습니다.");
  },

  async links(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const query = listLinksQuerySchema.parse(req.query);
    const links = await linkService.listByFolder(req.userId!, folderId, query.search);
    sendSuccess(res, links, "링크 목록을 조회했습니다.");
  },
};
