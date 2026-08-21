import { z } from "zod";

function sanitizeUrlInput(value: string) {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, "").trim();
}

function isValidUrl(value: string) {
  const sanitized = sanitizeUrlInput(value);
  const withProtocol = /^https?:\/\//i.test(sanitized) ? sanitized : `https://${sanitized}`;
  try {
    const parsed = new URL(withProtocol);
    return Boolean(parsed.hostname) && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export const linkFormSchema = z.object({
  url: z
    .string()
    .transform(sanitizeUrlInput)
    .pipe(
      z
        .string()
        .min(1, "URL을 입력해주세요.")
        .max(2048, "URL이 너무 깁니다.")
        .refine(isValidUrl, "올바른 URL 형식이 아닙니다.")
    ),
  title: z.string().trim().max(100, "제목은 100자 이내로 입력해주세요.").optional(),
  description: z.string().trim().max(500, "설명은 500자 이내로 입력해주세요.").optional(),
  category: z.string().trim().max(20, "카테고리는 20자 이내로 입력해주세요.").optional(),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
