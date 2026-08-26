import { z } from "zod";
import { tErr } from "../../../shared/i18n/useT";

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
        .min(1, tErr("validation.urlRequired"))
        .max(2048, tErr("validation.urlMax"))
        .refine(isValidUrl, tErr("validation.urlInvalid"))
    ),
  title: z.string().trim().max(100, tErr("validation.titleMax")).optional(),
  description: z.string().trim().max(500, tErr("validation.descriptionMax")).optional(),
  category: z.string().trim().max(20, tErr("validation.categoryMax")).optional(),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
