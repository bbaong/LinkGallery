import { Router } from "express";
import multer from "multer";
import { uploadController } from "./upload.controller";
import { requireAuth } from "../../middlewares/requireAuth";
import { asyncHandler } from "../../shared/asyncHandler";
import { ApiError } from "../../shared/ApiError";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "../../shared/constants";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      cb(ApiError.badRequest("jpeg, png, webp 형식의 이미지만 업로드할 수 있습니다."));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.use(requireAuth);

router.post("/folder-cover", upload.single("file"), asyncHandler(uploadController.uploadFolderCover));
router.delete("/folder-cover", asyncHandler(uploadController.deleteFolderCover));

export default router;
