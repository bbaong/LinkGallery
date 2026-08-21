import { prisma } from "../../config/prisma";
import type { AuthProvider, User } from "../../generated/prisma/client";

export function toPublicUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export const userRepository = {
  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  },

  create(data: {
    username: string;
    email?: string | null;
    passwordHash?: string | null;
    nickname: string;
    avatarUrl?: string | null;
    googleId?: string | null;
    provider?: AuthProvider;
  }) {
    return prisma.user.create({ data });
  },

  update(
    id: string,
    data: {
      googleId?: string | null;
      avatarUrl?: string | null;
      nickname?: string;
      email?: string | null;
      provider?: AuthProvider;
    }
  ) {
    return prisma.user.update({ where: { id }, data });
  },
};
