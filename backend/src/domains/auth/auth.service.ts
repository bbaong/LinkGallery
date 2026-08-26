import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { userRepository, toPublicUser } from "../users/user.repository";
import { signAuthToken } from "./jwt";
import { verifyFirebaseIdToken } from "./firebase";
import { prisma } from "../../config/prisma";
import type {
  SignupInput,
  LoginInput,
  GoogleLoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ConfirmUsernameInput,
  DeleteAccountInput,
} from "./auth.schema";
import { ApiError } from "../../shared/ApiError";
import { localImageStorageService } from "../../shared/storage/localImageStorageService";

const SALT_ROUNDS = 12;

function nicknameFromEmail(email: string) {
  const local = email.split("@")[0]?.trim() ?? "user";
  return local.slice(0, 20) || "user";
}

function usernameFromSource(source: string) {
  const cleaned = source.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const withLetter = /^[a-z]/.test(cleaned) ? cleaned : `u${cleaned}`;
  const trimmed = withLetter.slice(0, 20);
  if (trimmed.length >= 4) return trimmed;
  return `user${trimmed}`.padEnd(4, "0").slice(0, 20);
}

function isUniqueConstraintError(error: unknown, field: string) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; meta?: { target?: string | string[] } };
  if (candidate.code !== "P2002") return false;
  const target = candidate.meta?.target;
  if (typeof target === "string") return target.includes(field);
  if (Array.isArray(target)) return target.includes(field);
  return false;
}

async function allocateUsername(source: string) {
  const stem = usernameFromSource(source);
  for (let i = 0; i < 50; i += 1) {
    const suffix = i === 0 ? "" : String(i);
    const candidate = `${stem.slice(0, 20 - suffix.length)}${suffix}`;
    const existing = await userRepository.findByUsername(candidate);
    if (!existing) return candidate;
  }
  return `user${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export const authService = {
  async signup(input: SignupInput) {
    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) {
      throw ApiError.conflict("이미 사용 중인 아이디입니다.", "USERNAME_TAKEN");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    try {
      const user = await userRepository.create({
        username: input.username,
        passwordHash,
        nickname: input.nickname,
        provider: "LOCAL",
      });

      const token = signAuthToken({ userId: user.id });
      return { token, user: toPublicUser(user) };
    } catch (error) {
      if (isUniqueConstraintError(error, "username")) {
        throw ApiError.conflict("이미 사용 중인 아이디입니다.", "USERNAME_TAKEN");
      }
      throw error;
    }
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByUsername(input.username);
    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized("아이디 또는 비밀번호가 올바르지 않습니다.", "INVALID_CREDENTIALS");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized("아이디 또는 비밀번호가 올바르지 않습니다.", "INVALID_CREDENTIALS");
    }

    const token = signAuthToken({ userId: user.id });
    return { token, user: toPublicUser(user) };
  },

  async loginWithGoogle(input: GoogleLoginInput) {
    const decoded = await verifyFirebaseIdToken(input.idToken);

    if (!decoded.email) {
      throw ApiError.badRequest("Google 계정에서 이메일을 확인할 수 없습니다.");
    }

    const googleId = decoded.uid;
    const email = decoded.email.toLowerCase();
    const avatarUrl = typeof decoded.picture === "string" ? decoded.picture : null;
    const nickname =
      (typeof decoded.name === "string" && decoded.name.trim().slice(0, 20)) ||
      nicknameFromEmail(email);

    const byGoogleId = await userRepository.findByGoogleId(googleId);
    if (byGoogleId) {
      const canApplyGooglePhoto = !byGoogleId.avatarType && avatarUrl && avatarUrl !== byGoogleId.avatarUrl;
      const updated = canApplyGooglePhoto
        ? await userRepository.update(byGoogleId.id, { avatarUrl })
        : byGoogleId;
      const token = signAuthToken({ userId: updated.id });
      return { token, user: toPublicUser(updated) };
    }

    const byEmail = await userRepository.findByEmail(email);
    if (byEmail) {
      const linked = await userRepository.update(byEmail.id, {
        googleId,
        avatarUrl: byEmail.avatarType ? byEmail.avatarUrl : avatarUrl ?? byEmail.avatarUrl,
        provider: byEmail.passwordHash ? byEmail.provider : "GOOGLE",
      });
      const token = signAuthToken({ userId: linked.id });
      return { token, user: toPublicUser(linked) };
    }

    const username = await allocateUsername(email.split("@")[0] ?? "user");
    const created = await userRepository.create({
      username,
      email,
      nickname,
      avatarUrl,
      avatarType: avatarUrl ? "IMAGE" : null,
      avatarValue: avatarUrl,
      googleId,
      passwordHash: null,
      provider: "GOOGLE",
    });

    const token = signAuthToken({ userId: created.id });
    return { token, user: toPublicUser(created) };
  },

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.unauthorized();
    }
    return toPublicUser(user);
  },

  async isUsernameAvailable(username: string) {
    const existing = await userRepository.findByUsername(username);
    return !existing;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const current = await userRepository.findById(userId);
    if (!current) {
      throw ApiError.unauthorized();
    }

    if (input.email !== undefined) {
      const taken = await userRepository.findByEmail(input.email);
      if (taken && taken.id !== userId) {
        throw ApiError.conflict("이미 사용 중인 이메일입니다.", "EMAIL_TAKEN");
      }
    }

    const nextAvatarValue =
      input.avatarType === "IMAGE"
        ? input.avatarValue
        : input.avatarType
          ? null
          : input.avatarUrl;

    if (
      current.avatarUrl?.startsWith("/uploads/avatars/") &&
      nextAvatarValue !== undefined &&
      current.avatarUrl !== nextAvatarValue
    ) {
      await localImageStorageService.remove(current.avatarUrl, "avatars");
    }

    if (
      current.bannerType === "IMAGE" &&
      current.bannerValue.startsWith("/uploads/banners/") &&
      input.bannerValue !== undefined &&
      current.bannerValue !== input.bannerValue
    ) {
      await localImageStorageService.remove(current.bannerValue, "banners");
    }

    try {
      const updated = await userRepository.update(userId, {
        ...(input.nickname !== undefined ? { nickname: input.nickname } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
        ...(input.avatarType !== undefined
          ? {
              avatarType: input.avatarType,
              avatarValue: input.avatarValue ?? null,
              avatarUrl: input.avatarType === "IMAGE" ? input.avatarValue ?? null : null,
            }
          : {}),
        ...(input.bannerType !== undefined
          ? { bannerType: input.bannerType, bannerValue: input.bannerValue ?? current.bannerValue }
          : {}),
      });
      return toPublicUser(updated);
    } catch (error) {
      if (isUniqueConstraintError(error, "email")) {
        throw ApiError.conflict("이미 사용 중인 이메일입니다.", "EMAIL_TAKEN");
      }
      throw error;
    }
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.unauthorized();
    if (user.username !== input.username) {
      throw ApiError.forbidden("아이디가 일치하지 않습니다.", "USERNAME_MISMATCH");
    }
    if (!user.passwordHash) {
      throw ApiError.badRequest("비밀번호가 없는 계정입니다. Google 로그인을 사용 중이에요.");
    }

    const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw ApiError.unauthorized("지금 비밀번호가 올바르지 않습니다.", "INVALID_CREDENTIALS");
    }

    const sameAsCurrent = await bcrypt.compare(input.password, user.passwordHash);
    if (sameAsCurrent) {
      throw ApiError.badRequest("지금과 다른 비밀번호를 입력해주세요.");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    await userRepository.update(userId, { passwordHash });
  },

  async resetWorkspace(userId: string, input: ConfirmUsernameInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.unauthorized();
    if (user.username !== input.username) {
      throw ApiError.forbidden("아이디가 일치하지 않습니다.", "USERNAME_MISMATCH");
    }

    if (user.avatarUrl?.startsWith("/uploads/avatars/")) {
      await localImageStorageService.remove(user.avatarUrl, "avatars");
    }
    if (user.bannerType === "IMAGE" && user.bannerValue.startsWith("/uploads/banners/")) {
      await localImageStorageService.remove(user.bannerValue, "banners");
    }

    await prisma.$transaction([
      prisma.folder.deleteMany({ where: { userId } }),
      prisma.link.deleteMany({ where: { userId } }),
      prisma.folderMember.deleteMany({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl: null,
          avatarType: null,
          avatarValue: null,
          bannerType: "GRADIENT",
          bannerValue: "#C6B3FF|#6427C8",
        },
      }),
    ]);

    const refreshed = await userRepository.findById(userId);
    if (!refreshed) throw ApiError.unauthorized();
    return toPublicUser(refreshed);
  },

  async deleteAccount(userId: string, input: DeleteAccountInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.unauthorized();
    if (user.username !== input.username) {
      throw ApiError.forbidden("아이디가 일치하지 않습니다.", "USERNAME_MISMATCH");
    }
    if (user.passwordHash) {
      if (!input.currentPassword) {
        throw ApiError.badRequest("비밀번호를 입력해주세요.");
      }
      const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!matches) {
        throw ApiError.unauthorized("비밀번호가 올바르지 않습니다.", "INVALID_CREDENTIALS");
      }
    }

    if (user.avatarUrl?.startsWith("/uploads/avatars/")) {
      await localImageStorageService.remove(user.avatarUrl, "avatars");
    }
    if (user.bannerType === "IMAGE" && user.bannerValue.startsWith("/uploads/banners/")) {
      await localImageStorageService.remove(user.bannerValue, "banners");
    }

    await userRepository.delete(userId);
  },
};
