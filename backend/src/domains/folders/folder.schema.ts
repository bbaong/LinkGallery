import { z } from "zod";
import { GRADIENT_PRESET_KEYS } from "./folder.constants";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const CUSTOM_GRADIENT_PATTERN = /^#[0-9A-Fa-f]{6}\|#[0-9A-Fa-f]{6}$/;

const coverTypeSchema = z.enum(["SOLID", "GRADIENT", "GLASS", "IMAGE"], {
  message: "커버 유형을 선택해주세요.",
});

function isGradientValue(value: string) {
  return GRADIENT_PRESET_KEYS.includes(value as (typeof GRADIENT_PRESET_KEYS)[number]) || CUSTOM_GRADIENT_PATTERN.test(value);
}

function validateCoverValue(
  data: { coverType: "SOLID" | "GRADIENT" | "GLASS" | "IMAGE"; coverValue: string },
  ctx: z.RefinementCtx
) {
  if ((data.coverType === "SOLID" || data.coverType === "GLASS") && !HEX_COLOR_PATTERN.test(data.coverValue)) {
    ctx.addIssue({
      code: "custom",
      message: "올바른 색상을 선택해주세요.",
      path: ["coverValue"],
    });
  }
  if (data.coverType === "GRADIENT" && !isGradientValue(data.coverValue)) {
    ctx.addIssue({
      code: "custom",
      message: "올바른 그라데이션을 선택해주세요.",
      path: ["coverValue"],
    });
  }
  if (data.coverType === "IMAGE" && !data.coverValue.startsWith("/uploads/")) {
    ctx.addIssue({
      code: "custom",
      message: "업로드된 이미지를 선택해주세요.",
      path: ["coverValue"],
    });
  }
}

export const createFolderSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "폴더 이름을 입력해주세요.")
      .max(50, "폴더 이름은 50자 이내로 입력해주세요."),
    icon: z.string().trim().max(64, "이모지가 너무 깁니다.").optional().nullable(),
    coverType: coverTypeSchema,
    coverValue: z.string().min(1, "커버를 선택해주세요.").max(2048),
  })
  .superRefine(validateCoverValue);

export const updateFolderSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "폴더 이름을 입력해주세요.")
      .max(50, "폴더 이름은 50자 이내로 입력해주세요.")
      .optional(),
    icon: z.string().trim().max(64, "이모지가 너무 깁니다.").optional().nullable(),
    coverType: z.enum(["SOLID", "GRADIENT", "GLASS", "IMAGE"]).optional(),
    coverValue: z.string().min(1, "커버를 선택해주세요.").max(2048).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.coverType && data.coverValue) {
      validateCoverValue({ coverType: data.coverType, coverValue: data.coverValue }, ctx);
    }
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "수정할 내용을 입력해주세요.",
  });

export const joinFolderSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
    .refine((value) => value.length === 6, {
      message: "초대 코드를 확인해주세요.",
    }),
});

export const listActivitiesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type JoinFolderInput = z.infer<typeof joinFolderSchema>;
