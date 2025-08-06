import type { Request, Response } from "express";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import { messages } from "@packages/shared";

// TOTPのQRコードを取得
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const secret = speakeasy.generateSecret();
    // console.log("The secret object is ", secret);

    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: "jsapp",
      encoding: "base32",
    });
    const QRCode = await qrCode.toDataURL(url);

    req.session.secret = secret.base32;
    console.log("req.session.secret: ", req.session.secret);

    res.status(200).json({ QRCode });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "QRコード生成に失敗しました" });
  }
};

// TOTP認証してMFAを設定
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const token = req.body.join("");
    const user = req.user as User;
    const secret = req.session.secret;
    if (!secret) {
      throw new Error("Secret is not set");
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token,
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

// TOTPによるMFAを外す
export const reset2FA = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    if (user.isMfaActive === false) {
      res.status(200).json({ message: "TOTP is not set" });
      return;
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorSecret: "",
        isMfaActive: false,
      },
    });
    res.status(200).json({ message: "2FA reset successful" });
  } catch (error) {
    console.log("RESET error: ", error);
    res.status(500).json({ message: "Error reseting 2FA" });
  }
};
