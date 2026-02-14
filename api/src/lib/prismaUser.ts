import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

// ユーザー情報をメールアドレスから取得
export const findUserByEmail = async (email: string) =>
  await prisma.user.findUnique({
    where: { email },
  });

// ユーザー情報を取得
export const findUser = async (id: number) =>
  await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isMfaActive: true,
      isFido2Active: true,
      twoFactorSecret: true,
      passKeys: true,
    },
  });

// API返却用Userカラム
export const frontSelectUser = {
  firstName: true,
  lastName: true,
  email: true,
  isMfaActive: true,
  isFido2Active: true,
};

type UserKeys = keyof typeof frontSelectUser;

export type UpdatedUser = {
  [K in UserKeys]: User[K];
};
