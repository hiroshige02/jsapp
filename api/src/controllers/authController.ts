import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import { messages } from "@packages/shared";
import { cookieConfig } from "@/config/passportConfig";

// TOTPのQRコードを取得
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const secret = speakeasy.generateSecret();

    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: "jsapp",
      encoding: "base32",
    });
    const QRCode = await qrCode.toDataURL(url);

    req.session.secret = secret.base32;

    res.status(200).json({ QRCode });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "QRコード生成に失敗しました" });
  }
};

// TOTP認証してMFAを設定
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const token = req.body.join(""); // 6つの数字の配列を文字列に
    const user = req.user as User;
    const secret = req.session.secret;
    if (!secret) {
      return res.status(400).json({ message: messages.authFailed });
    }

    console.log("verifySecret: ", secret);
    console.log("token: ", token);

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token,
      window: 1, // 1スロット(±30秒)のずれの許容
    });

    // console.log("token: ", token);
    // console.log("secret: ", secret);
    // console.log("verified: ", verified);

    if (verified) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorSecret: secret,
          isMfaActive: true,
        },
      });

      res.status(200).json({ message: "TOTP設定が完了しました" });
    } else {
      res.status(400).json({ message: messages.authFailed });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: messages.serverError });
  }
};

// TOTP設定リセット
export const reset2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    if (user.isMfaActive === false) {
      res.status(400).json({ message: "TOTPが設定されていません" });
      return;
    }

    if (user.isFido2Active === true) {
      res
        .status(400)
        .json({ message: "FIDO2設定時はTOTP設定の解除はできません" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorSecret: "",
        isMfaActive: false,
      },
    });
    res
      .status(200)
      .json({ message: "TOTP設定を解除しました", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "TOTP設定の解除に失敗しました" });
  }
};

// ログアウト
export const logout = async (_, res: Response) => {
  res.clearCookie("token", cookieConfig);
  res.clearCookie("tmpToken", cookieConfig);
  res.sendStatus(200);
};
