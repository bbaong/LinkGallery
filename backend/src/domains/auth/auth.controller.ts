import type { Request, Response } from "express";
import { authService } from "./auth.service";
import {
  signupSchema,
  loginSchema,
  googleLoginSchema,
  usernameQuerySchema,
  updateProfileSchema,
  changePasswordSchema,
  confirmUsernameSchema,
  deleteAccountSchema,
} from "./auth.schema";
import { sendSuccess } from "../../shared/response";
import { AUTH_COOKIE_NAME } from "../../shared/constants";
import { env, isProduction } from "../../config/env";
import { parseDurationToMs } from "../../shared/time";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  maxAge: parseDurationToMs(env.JWT_EXPIRES_IN),
  path: "/",
};

export const authController = {
  async signup(req: Request, res: Response) {
    const input = signupSchema.parse(req.body);
    const { token, user } = await authService.signup(input);
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
    sendSuccess(res, user, "회원가입이 완료되었습니다.", 201);
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const { token, user } = await authService.login(input);
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
    sendSuccess(res, user, "로그인되었습니다.");
  },

  async google(req: Request, res: Response) {
    const input = googleLoginSchema.parse(req.body);
    const { token, user } = await authService.loginWithGoogle(input);
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
    sendSuccess(res, user, "Google 로그인되었습니다.");
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    sendSuccess(res, null, "로그아웃되었습니다.");
  },

  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.userId!);
    sendSuccess(res, user, "사용자 정보를 조회했습니다.");
  },

  async checkUsername(req: Request, res: Response) {
    const { username } = usernameQuerySchema.parse(req.query);
    const available = await authService.isUsernameAvailable(username);
    sendSuccess(
      res,
      { available },
      available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다."
    );
  },

  async updateProfile(req: Request, res: Response) {
    const input = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.userId!, input);
    sendSuccess(res, user, "프로필이 저장되었습니다.");
  },

  async changePassword(req: Request, res: Response) {
    const input = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.userId!, input);
    sendSuccess(res, null, "비밀번호가 변경되었습니다.");
  },

  async resetWorkspace(req: Request, res: Response) {
    const input = confirmUsernameSchema.parse(req.body);
    const user = await authService.resetWorkspace(req.userId!, input);
    sendSuccess(res, user, "데이터를 초기화했습니다.");
  },

  async deleteAccount(req: Request, res: Response) {
    const input = deleteAccountSchema.parse(req.body);
    await authService.deleteAccount(req.userId!, input);
    res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    sendSuccess(res, null, "계정이 삭제되었습니다.");
  },
};
