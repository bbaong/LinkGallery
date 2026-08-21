import { z } from "zod";

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

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

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

export const updateEmailSchema = z.object({
  email: emailSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type UpdateEmailFormValues = z.infer<typeof updateEmailSchema>;
