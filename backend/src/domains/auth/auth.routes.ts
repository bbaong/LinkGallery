import { Router } from "express";
import { authController } from "./auth.controller";
import { requireAuth } from "../../middlewares/requireAuth";
import { authRateLimiter } from "../../middlewares/rateLimiter";
import { asyncHandler } from "../../shared/asyncHandler";

const router = Router();

router.post("/signup", authRateLimiter, asyncHandler(authController.signup));
router.post("/login", authRateLimiter, asyncHandler(authController.login));
router.post("/google", authRateLimiter, asyncHandler(authController.google));
router.post("/logout", asyncHandler(authController.logout));
router.get("/username-available", authRateLimiter, asyncHandler(authController.checkUsername));
router.get("/me", requireAuth, asyncHandler(authController.me));
router.patch("/me", requireAuth, asyncHandler(authController.updateProfile));

export default router;
