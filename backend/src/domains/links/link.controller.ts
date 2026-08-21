import type { Request, Response } from "express";
import { linkService } from "./link.service";
import {
  createLinkSchema,
  updateLinkSchema,
  listLinksQuerySchema,
  recentLinksQuerySchema,
  reorderLinksSchema,
} from "./link.schema";
import { sendSuccess } from "../../shared/response";
import { requireParam } from "../../shared/params";

export const linkController = {
  async listByFolder(req: Request, res: Response) {
    const folderId = requireParam(req.params, "folderId");
    const query = listLinksQuerySchema.parse(req.query);
    const links = await linkService.listByFolder(req.userId!, folderId, query.search);
    sendSuccess(res, links, "링크 목록을 조회했습니다.");
  },

  async listRecent(req: Request, res: Response) {
    const query = recentLinksQuerySchema.parse(req.query);
    const links = await linkService.listRecent(req.userId!, query.limit);
    sendSuccess(res, links, "최근 링크를 조회했습니다.");
  },

  async listAll(req: Request, res: Response) {
    const query = recentLinksQuerySchema.parse(req.query);
    const links = await linkService.listAll(req.userId!, query.limit ?? 200);
    sendSuccess(res, links, "링크 목록을 조회했습니다.");
  },

  async create(req: Request, res: Response) {
    const input = createLinkSchema.parse(req.body);
    const link = await linkService.createLink(req.userId!, input);
    sendSuccess(res, link, "링크가 저장되었습니다.", 201);
  },

  async reorder(req: Request, res: Response) {
    const input = reorderLinksSchema.parse(req.body);
    const links = await linkService.reorderLinks(req.userId!, input);
    sendSuccess(res, links, "링크 순서를 저장했습니다.");
  },

  async update(req: Request, res: Response) {
    const linkId = requireParam(req.params, "linkId");
    const input = updateLinkSchema.parse(req.body);
    const link = await linkService.updateLink(req.userId!, linkId, input);
    sendSuccess(res, link, "링크가 수정되었습니다.");
  },

  async recordVisit(req: Request, res: Response) {
    const linkId = requireParam(req.params, "linkId");
    const link = await linkService.recordVisit(req.userId!, linkId);
    sendSuccess(res, link, "접속 기록을 저장했습니다.");
  },

  async remove(req: Request, res: Response) {
    const linkId = requireParam(req.params, "linkId");
    await linkService.deleteLink(req.userId!, linkId);
    sendSuccess(res, null, "링크가 삭제되었습니다.");
  },
};
