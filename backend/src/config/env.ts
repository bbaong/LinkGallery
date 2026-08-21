import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL이 설정되지 않았습니다."),
  JWT_SECRET: z.string().min(1, "JWT_SECRET이 설정되지 않았습니다."),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().min(1, "FRONTEND_URL이 설정되지 않았습니다."),
  UPLOAD_DIR: z.string().default("uploads"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(`[env] 환경변수 설정이 올바르지 않습니다:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
