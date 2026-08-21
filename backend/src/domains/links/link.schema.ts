import { z } from "zod";

const categorySchema = z
  .union([z.string(), z.null()])
  .transform((value) => {
    if (value == null) return null;
    const normalized = value.trim().replace(/\s+/g, " ");
    return normalized.length > 0 ? normalized : null;
  })
  .refine((value) => value === null || value.length <= 20, {
    message: "카테고리는 20자 이내로 입력해주세요.",
  });

export const createLinkSchema = z.object({
  folderId: z.string().min(1, "폴더를 선택해주세요."),
  url: z.string().trim().min(1, "URL을 입력해주세요.").max(2048, "URL이 너무 깁니다."),
  title: z.string().trim().max(100, "제목은 100자 이내로 입력해주세요.").optional(),
  description: z.string().trim().max(500, "설명은 500자 이내로 입력해주세요.").optional(),
  category: categorySchema.optional(),
});

export const updateLinkSchema = z
  .object({
    url: z.string().trim().min(1, "URL을 입력해주세요.").max(2048, "URL이 너무 깁니다.").optional(),
    title: z.string().trim().max(100, "제목은 100자 이내로 입력해주세요.").optional(),
    description: z.string().trim().max(500, "설명은 500자 이내로 입력해주세요.").optional(),
    category: categorySchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "수정할 내용을 입력해주세요.",
  });

export const listLinksQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export const recentLinksQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export const reorderLinksSchema = z.object({
  folderId: z.string().min(1, "폴더를 선택해주세요."),
  orderedIds: z.array(z.string().min(1)).max(500),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type ListLinksQuery = z.infer<typeof listLinksQuerySchema>;
export type RecentLinksQuery = z.infer<typeof recentLinksQuerySchema>;
export type ReorderLinksInput = z.infer<typeof reorderLinksSchema>;
