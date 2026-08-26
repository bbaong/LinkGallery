import { z } from "zod";
import { isValidCoverValue } from "../lib/coverValue";
import { tErr } from "../../../shared/i18n/useT";

export const folderFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, tErr("validation.folderNameRequired"))
      .max(50, tErr("validation.folderNameMax")),
    icon: z.string().trim().max(64, tErr("validation.emojiTooLong")).optional(),
    coverType: z.enum(["SOLID", "GRADIENT", "GLASS", "IMAGE"]),
    coverValue: z.string().min(1, tErr("validation.coverRequired")),
  })
  .superRefine((data, ctx) => {
    if (!isValidCoverValue(data.coverType, data.coverValue)) {
      ctx.addIssue({
        code: "custom",
        message: tErr("validation.coverRequired").error(),
        path: ["coverValue"],
      });
    }
  });

export type FolderFormValues = z.infer<typeof folderFormSchema>;
