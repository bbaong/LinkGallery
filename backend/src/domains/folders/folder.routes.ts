import { Router } from "express";
import { folderController } from "./folder.controller";
import { requireAuth } from "../../middlewares/requireAuth";
import { asyncHandler } from "../../shared/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(folderController.list));
router.post("/", asyncHandler(folderController.create));
router.post("/join", asyncHandler(folderController.join));
router.get("/:folderId", asyncHandler(folderController.detail));
router.patch("/:folderId", asyncHandler(folderController.update));
router.delete("/:folderId", asyncHandler(folderController.remove));
router.get("/:folderId/links", asyncHandler(folderController.links));
router.post("/:folderId/invite", asyncHandler(folderController.getOrCreateInvite));
router.post("/:folderId/invite/regenerate", asyncHandler(folderController.regenerateInvite));

export default router;
