import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { env } from "./config/env";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./domains/auth/auth.routes";
import folderRoutes from "./domains/folders/folder.routes";
import uploadRoutes from "./domains/folders/upload.routes";
import linkRoutes from "./domains/links/link.routes";

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
});
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), env.UPLOAD_DIR))
);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" }, message: "서버가 정상 동작 중입니다." });
});

app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/links", linkRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
