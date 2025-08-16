import type { Request, Response } from "express";
import { hash } from "argon2";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { cookieConfig } from "@/config/passportConfig";
import { messages } from "@packages/shared";
import speakeasy from "speakeasy";
import { jwtVerify, loginJwtSign } from "@/lib/jwt";
import { findUser } from "@/lib/prismaUser";

// ユーザー登録
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email } = req.body;
  const password = await hash(req.body.password);

  try {
    await prisma.user.create({
      data: { firstName, lastName, email, password },
    });
    res.status(200).json({ message: "Register success" });
  } catch (errors) {
    res.status(500).json({ errors });
  }
};

// パスワードログイン
export const login = async (req: Request, res: Response) => {
  const user = req.user as User;

  if (!user.isMfaActive) {
    // MFA設定なし
    const jwtToken = loginJwtSign({ sub: user.id });
    res.cookie("token", jwtToken, cookieConfig);
  } else {
    // MFA設定あり
    // TOTPコード認証用一時token送信
    const jwtTmpToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_TMP_SECRET!,
      { expiresIn: "1m" }!
    );
    res.cookie("tmpToken", jwtTmpToken, cookieConfig);
  }

  res.status(200).json({
    message: "",
    totpRequire: user.isMfaActive,
    user: user.isMfaActive ? null : user,
  });
};

// TOTPコード認証
export const totpLogin = async (req: Request, res: Response) => {
  try {
    const tmpToken = req.signedCookies?.tmpToken;
    if (!tmpToken) {
      res.status(500).json({ message: "パスワードログインが必要です" });
      return;
    }

    const jwtPayload = jwt.verify(tmpToken, process.env.JWT_TMP_SECRET!);
    const user = await findUser(Number(jwtPayload.sub));

    if (!user || !user.twoFactorSecret) {
      res.status(500).json({ message: "不正な操作です" });
      return;
    }

    const token = req.body.join("");
    const secret = user.twoFactorSecret;

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token,
      window: 1, // 1スロット(±30秒)のずれの許容
    });

    if (verified) {
      const jwtToken = loginJwtSign({ sub: user.id });
      res.cookie("token", jwtToken, cookieConfig);
      res.clearCookie("tmpToken", cookieConfig);
      res.status(200).json({
        message: "2FA successful",
        user,
      });
    } else {
      res.status(400).json({ message: messages.authFailed });
    }
  } catch (errors) {
    console.log(errors);
    res.status(500).json({ message: messages.unexpectedError });
  }
};

// 認証チェック
export const check = async (req: Request, res: Response) => {
  try {
    const jwtPayload = jwtVerify(req);
    if (!jwtPayload)
      return res.status(400).json({ message: messages.authFailed });

    const user = await findUser(Number(jwtPayload.sub));
    if (!user) return res.status(400).json({ message: messages.authFailed });

    res.status(200).json({
      message: "Auth check success",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: messages.serverError });
  }
};
