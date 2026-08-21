import { z } from "zod";
import { isValidCoverValue } from "../lib/coverValue";

export const folderFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "폴더 이름을 입력해주세요.")
      .max(50, "폴더 이름은 50자 이내로 입력해주세요."),
    icon: z.string().trim().max(64, "이모지가 너무 깁니다.").optional(),
    coverType: z.enum(["SOLID", "GRADIENT", "GLASS", "IMAGE"]),
    coverValue: z.string().min(1, "커버를 선택해주세요."),
  })
  .superRefine((data, ctx) => {
    if (!isValidCoverValue(data.coverType, data.coverValue)) {
      ctx.addIssue({
        code: "custom",
        message: "커버를 선택해주세요.",
        path: ["coverValue"],
      });
    }
  });

export type FolderFormValues = z.infer<typeof folderFormSchema>;
