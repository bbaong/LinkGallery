import { Router } from "express";
import { linkController } from "./link.controller";
import { requireAuth } from "../../middlewares/requireAuth";
import { asyncHandler } from "../../shared/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/recent", asyncHandler(linkController.listRecent));
router.get("/", asyncHandler(linkController.listAll));
router.post("/", asyncHandler(linkController.create));
router.patch("/reorder", asyncHandler(linkController.reorder));
router.post("/:linkId/visit", asyncHandler(linkController.recordVisit));
router.patch("/:linkId", asyncHandler(linkController.update));
router.delete("/:linkId", asyncHandler(linkController.remove));

export default router;
