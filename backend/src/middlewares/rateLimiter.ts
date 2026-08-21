import rateLimit from "express-rate-limit";
import { sendFail } from "../shared/response";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendFail(res, 429, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", "TOO_MANY_REQUESTS");
  },
});
