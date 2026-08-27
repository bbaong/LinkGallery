import type { Request, Response } from "express";
import { folderService } from "./folder.service";
import { createFolderSchema, joinFolderSchema, updateFolderSchema } from "./folder.schema";
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

  async getInvite(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const invite = await folderService.getInvite(req.userId!, folderId);
    sendSuccess(res, invite, "초대 코드를 조회했습니다.");
  },

  async getOrCreateInvite(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const invite = await folderService.getOrCreateInviteCode(req.userId!, folderId);
    sendSuccess(res, invite, "초대 코드를 준비했습니다.");
  },

  async regenerateInvite(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const invite = await folderService.regenerateInviteCode(req.userId!, folderId);
    sendSuccess(res, invite, "초대 코드를 새로 만들었습니다.");
  },

  async revokeInvite(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    await folderService.revokeInvite(req.userId!, folderId);
    sendSuccess(res, null, "초대를 닫았습니다.");
  },

  async join(req: Request, res: Response) {
    const input = joinFolderSchema.parse(req.body);
    const folder = await folderService.joinByCode(req.userId!, input.code);
    sendSuccess(res, folder, `${folder.name} 폴더에 참여했어요 🎉`);
  },

  async leave(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    await folderService.leaveFolder(req.userId!, folderId);
    sendSuccess(res, null, "폴더에서 나갔습니다.");
  },

  async removeMember(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const userId = requireParam(req.params, "userId");
    await folderService.removeMember(req.userId!, folderId, userId);
    sendSuccess(res, null, "멤버를 내보냈습니다.");
  },
};
