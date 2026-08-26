import { z } from "zod";
import { tErr } from "../../../shared/i18n/useT";

export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(4, tErr("validation.usernameMin"))
  .max(20, tErr("validation.usernameMax"))
  .regex(/^[a-z][a-z0-9_]*$/, tErr("validation.usernamePattern"));

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(EMAIL_PATTERN, tErr("validation.email"));

const passwordSchema = z
  .string()
  .min(8, tErr("validation.passwordMin"))
  .max(72, tErr("validation.passwordMax"))
  .regex(/[A-Za-z]/, tErr("validation.passwordLetter"))
  .regex(/\d/, tErr("validation.passwordNumber"))
  .regex(/[^A-Za-z0-9]/, tErr("validation.passwordSpecial"));

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, tErr("validation.passwordRequired")),
});

export const signupSchema = z
  .object({
    username: usernameSchema,
    nickname: z
      .string()
      .trim()
      .min(2, tErr("validation.nicknameMin"))
      .max(20, tErr("validation.nicknameMax")),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, tErr("validation.passwordConfirmRequired")),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    ...tErr("validation.passwordMismatch"),
    path: ["passwordConfirm"],
  });

export const updateEmailSchema = z.object({
  email: emailSchema,
});

export const updateProfileFormSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, tErr("validation.nicknameMin"))
    .max(20, tErr("validation.nicknameMax")),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => value.length === 0 || EMAIL_PATTERN.test(value), tErr("validation.email")),
});

export const changePasswordFormSchema = z
  .object({
    username: usernameSchema,
    currentPassword: z.string().min(1, tErr("validation.currentPassword")),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, tErr("validation.passwordConfirmRequired")),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    ...tErr("validation.passwordMismatch"),
    path: ["passwordConfirm"],
  });

export const confirmUsernameFormSchema = z.object({
  username: usernameSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type UpdateEmailFormValues = z.infer<typeof updateEmailSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
export type ConfirmUsernameFormValues = z.infer<typeof confirmUsernameFormSchema>;
