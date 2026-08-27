import { Router } from "express";
import { folderController } from "./folder.controller";
import { requireAuth } from "../../middlewares/requireAuth";
import { joinFolderRateLimiter } from "../../middlewares/rateLimiter";
import { asyncHandler } from "../../shared/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(folderController.list));
router.post("/", asyncHandler(folderController.create));
router.post("/join", joinFolderRateLimiter, asyncHandler(folderController.join));
router.get("/:folderId", asyncHandler(folderController.detail));
router.patch("/:folderId", asyncHandler(folderController.update));
router.delete("/:folderId", asyncHandler(folderController.remove));
router.get("/:folderId/links", asyncHandler(folderController.links));
router.get("/:folderId/activities", asyncHandler(folderController.activities));
router.get("/:folderId/invite", asyncHandler(folderController.getInvite));
router.post("/:folderId/invite", asyncHandler(folderController.getOrCreateInvite));
router.post("/:folderId/invite/regenerate", asyncHandler(folderController.regenerateInvite));
router.delete("/:folderId/invite", asyncHandler(folderController.revokeInvite));
router.delete("/:folderId/members/me", asyncHandler(folderController.leave));
router.delete("/:folderId/members/:userId", asyncHandler(folderController.removeMember));

export default router;
