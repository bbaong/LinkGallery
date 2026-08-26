import { z } from "zod";
import { GRADIENT_PRESET_KEYS } from "../folders/folder.constants";

export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(4, "아이디는 4자 이상이어야 합니다.")
  .max(20, "아이디는 20자 이내로 입력해주세요.")
  .regex(/^[a-z][a-z0-9_]*$/, "아이디는 영문으로 시작하고, 영문·숫자·밑줄만 사용할 수 있습니다.");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(EMAIL_PATTERN, "올바른 이메일 형식이 아닙니다.");

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(72, "비밀번호는 72자 이내로 입력해주세요.")
  .regex(/[A-Za-z]/, "비밀번호에 영문을 포함해주세요.")
  .regex(/\d/, "비밀번호에 숫자를 포함해주세요.")
  .regex(/[^A-Za-z0-9]/, "비밀번호에 특수문자를 포함해주세요.");

export const signupSchema = z
  .object({
    username: usernameSchema,
    nickname: z
      .string()
      .trim()
      .min(2, "닉네임은 2자 이상이어야 합니다.")
      .max(20, "닉네임은 20자 이내로 입력해주세요."),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "Google 인증 토큰이 필요합니다."),
});

export const usernameQuerySchema = z.object({
  username: usernameSchema,
});

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const CUSTOM_GRADIENT_PATTERN = /^#[0-9A-Fa-f]{6}\|#[0-9A-Fa-f]{6}$/;
const appearanceTypeSchema = z.enum(["SOLID", "GRADIENT", "IMAGE"]);

function isGradientValue(value: string) {
  return GRADIENT_PRESET_KEYS.includes(value as (typeof GRADIENT_PRESET_KEYS)[number]) || CUSTOM_GRADIENT_PATTERN.test(value);
}

function isAvatarImageValue(value: string) {
  return /^\/uploads\/avatars\/[A-Za-z0-9._-]+$/.test(value) || /^https:\/\//i.test(value);
}

function isBannerImageValue(value: string) {
  return /^\/uploads\/banners\/[A-Za-z0-9._-]+$/.test(value);
}

function validateAppearance(
  data: { type: "SOLID" | "GRADIENT" | "IMAGE"; value: string; kind: "avatar" | "banner" },
  ctx: z.RefinementCtx,
  valuePath: string
) {
  if (data.type === "SOLID" && !HEX_COLOR_PATTERN.test(data.value)) {
    ctx.addIssue({ code: "custom", message: "올바른 색상을 선택해주세요.", path: [valuePath] });
  }
  if (data.type === "GRADIENT" && !isGradientValue(data.value)) {
    ctx.addIssue({ code: "custom", message: "올바른 그라데이션을 선택해주세요.", path: [valuePath] });
  }
  if (data.type === "IMAGE") {
    const ok = data.kind === "avatar" ? isAvatarImageValue(data.value) : isBannerImageValue(data.value);
    if (!ok) {
      ctx.addIssue({ code: "custom", message: "업로드된 이미지를 선택해주세요.", path: [valuePath] });
    }
  }
}

export const updateProfileSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(2, "닉네임은 2자 이상이어야 합니다.")
      .max(20, "닉네임은 20자 이내로 입력해주세요.")
      .optional(),
    email: emailSchema.optional(),
    avatarUrl: z
      .union([
        z
          .string()
          .trim()
          .regex(/^\/uploads\/avatars\/[A-Za-z0-9._-]+$/, "올바른 프로필 이미지가 아닙니다."),
        z.string().trim().url(),
        z.null(),
      ])
      .optional(),
    avatarType: appearanceTypeSchema.nullable().optional(),
    avatarValue: z.string().trim().max(2048).nullable().optional(),
    bannerType: appearanceTypeSchema.optional(),
    bannerValue: z.string().trim().min(1).max(2048).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.avatarType) {
      if (!data.avatarValue) {
        ctx.addIssue({ code: "custom", message: "프로필 스타일을 선택해주세요.", path: ["avatarValue"] });
      } else {
        validateAppearance({ type: data.avatarType, value: data.avatarValue, kind: "avatar" }, ctx, "avatarValue");
      }
    }
    if (data.bannerType) {
      if (!data.bannerValue) {
        ctx.addIssue({ code: "custom", message: "배너 스타일을 선택해주세요.", path: ["bannerValue"] });
      } else {
        validateAppearance({ type: data.bannerType, value: data.bannerValue, kind: "banner" }, ctx, "bannerValue");
      }
    }
  })
  .refine(
    (data) =>
      data.nickname !== undefined ||
      data.email !== undefined ||
      data.avatarUrl !== undefined ||
      data.avatarType !== undefined ||
      data.bannerType !== undefined,
    {
      message: "수정할 내용을 입력해주세요.",
    }
  );

export const changePasswordSchema = z
  .object({
    username: usernameSchema,
    currentPassword: z.string().min(1, "지금 비밀번호를 입력해주세요."),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export const confirmUsernameSchema = z.object({
  username: usernameSchema,
});

export const deleteAccountSchema = z.object({
  username: usernameSchema,
  currentPassword: z.string().min(1).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ConfirmUsernameInput = z.infer<typeof confirmUsernameSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
