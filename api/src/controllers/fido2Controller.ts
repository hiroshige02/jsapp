import {
  generateRegistrationOptions,
  PublicKeyCredentialCreationOptionsJSON,
  AuthenticatorTransportFuture,
  verifyRegistrationResponse,
  CredentialDeviceType,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import { Request, Response } from "express";
import { messages } from "@packages/shared";
// import jwt from "jsonwebtoken";
import { jwtVerify, loginJwtSign } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { findUser } from "@/lib/prismaUser";
// import {getUser} from "@/lib/prismaUser";

import { fido2CookieConfig } from "@/config/passportConfig";
import { cookieConfig } from "@/config/passportConfig";
import { User } from "@prisma/client";

// ************* FIDO2 **************

// RP情報
const rpName: string = process.env.APP_NAME!;
const rpID: string = process.env.DOMAIN!;
// const origin: string = process.env.FRONT_BASE_URL!.split("//")[1];

type Passkey = {
  webAuthnUserID: Base64URLString;
  id: Base64URLString;
  publicKey: Uint8Array;
  userId: number;
  counter: number;
  backupEligible: boolean;
  backupStatus: boolean;
  transports?: string;
};

// 登録オプションを作成
export const generateFido2RegistOptions = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User;

  if (user.isMfaActive === false)
    return res.status(400).json({ message: "FIDO2設定前にTOTP設定が必要です" });

  const userAndPasskeys = await findUser(user.id);

  const formatPasskeys = userAndPasskeys!.passKeys.map((pass) => ({
    id: pass.id,
    transports: pass.transports?.split(",") as AuthenticatorTransportFuture[],
  }));

  const userName = user.firstName;
  const options: PublicKeyCredentialCreationOptionsJSON =
    await generateRegistrationOptions({
      rpName,
      rpID,
      userName,
      attestationType: "none",
      // Prevent users from re-registering existing authenticators
      excludeCredentials: formatPasskeys,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "discouraged",
        authenticatorAttachment: "platform", // 'cross-platform'
        // https://simplewebauthn.dev/docs/packages/server#guiding-use-of-authenticators-via-authenticatorselection
      },
    });

  req.session.registOptions = options;
  res.status(200).json({ options });
};

// FIDO2認証・設定
export const verifyFido2 = async (req: Request, res: Response) => {
  const user = req.user as User;
  if (user.isMfaActive === false)
    return res.status(400).json({ message: "FIDO2設定前にTOTP設定が必要です" });

  const options = req.session?.registOptions;
  if (!options)
    return res.status(500).json({ message: messages.fide2RegisterFailed });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: options.challenge,
      expectedOrigin: process.env.FRONT_BASE_URL!,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: messages.fide2RegisterFailed });
  }

  const { registrationInfo } = verification;
  const { credential, credentialDeviceType, credentialBackedUp } =
    registrationInfo;

  try {
    const newPasskey: Passkey = {
      // A unique identifier for the credential
      id: credential.id,
      // The public key bytes, used for subsequent authentication signature verification
      publicKey: credential.publicKey,
      userId: Number(user.id),
      // Created by `generateRegistrationOptions()` in Step 1
      webAuthnUserID: options.user.id,
      // The number of times the authenticator has been used on this site so far
      counter: credential.counter,
      // Whether the passkey is eligible for backe up(to synchronize across multi devices)
      backupEligible: credentialDeviceType === "multiDevice",
      // Whether the passkey has been backed up in some way
      backupStatus: credentialBackedUp,
      // How the browser can talk with this credential's authenticator
      transports: credential.transports?.join(","),
    };
    // console.log("newPasskey: ",newPasskey);

    // FIDO2用ユーザー識別情報(id)をCookieにセット
    res.cookie("jsappFido2", user.id, fido2CookieConfig);

    let updatedUser;
    await prisma.$transaction(async (tx) => {
      await tx.passkey.create({ data: newPasskey });
      updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: { isFido2Active: true },
      });
    });
    return res
      .status(200)
      .json({ message: "FIDO2設定が完了しました", user: updatedUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: messages.fide2RegisterFailed });
  }
};

// FIDO2認証用オプションを取得
export const generateFido2AuthOptions = async (req: Request, res: Response) => {
  const jsappFido2 = req.signedCookies?.jsappFido2; // user.id
  if (!jsappFido2)
    return res.status(400).json({ message: messages.fide2AuthFailed });

  const user = await findUser(Number(jsappFido2));
  if (!user) return res.status(400).json({ message: messages.authFailed });

  const userAndPasskeys = await findUser(user.id);
  const userPasskeys = userAndPasskeys?.passKeys;
  // console.log("userPasskeys: ", userPasskeys);

  if (!userPasskeys)
    return res.status(400).json({ message: messages.fide2AuthFailed });

  const options: PublicKeyCredentialRequestOptionsJSON =
    await generateAuthenticationOptions({
      rpID,
      // Require users to use a previously-registered authenticator
      allowCredentials: userPasskeys?.map((passkey) => ({
        id: passkey.id,
        transports: passkey.transports?.split(
          ","
        ) as AuthenticatorTransportFuture[],
      })),
      userVerification: "discouraged",
    });

  req.session.authOptions = options;
  res.status(200).json({ options });
};

// fido2ログイン
export const fido2Login = async (req: Request, res: Response) => {
  const jsappFido2 = req.signedCookies?.jsappFido2; // user.id
  if (!jsappFido2)
    return res.status(400).json({ message: messages.fide2AuthFailed });

  const userAndPasskeys = await findUser(Number(jsappFido2));
  if (!userAndPasskeys)
    return res.status(400).json({ message: messages.fide2AuthFailed });

  const userPasskeys = userAndPasskeys?.passKeys;
  const currentOptions = req.session?.authOptions;
  const fido2Id = req.body.id;
  const passkey = userPasskeys?.find((pass) => pass.id === fido2Id);

  if (!userPasskeys || !currentOptions || !fido2Id || !passkey) {
    return res.status(400).json({ message: messages.fide2AuthFailed });
  }

  try {
    await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: currentOptions.challenge,
      expectedOrigin: process.env.FRONT_BASE_URL!,
      expectedRPID: rpID,
      credential: {
        id: passkey.id,
        publicKey: passkey.publicKey,
        counter: passkey.counter,
        transports: passkey.transports?.split(
          ","
        ) as AuthenticatorTransportFuture[],
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: messages.fide2AuthFailed });
  }

  const jwtToken = loginJwtSign({ sub: userAndPasskeys.id });
  res.cookie("token", jwtToken, cookieConfig);
  res.status(200).json({
    user: {
      firstName: userAndPasskeys.firstName,
      lastName: userAndPasskeys.lastName,
      email: userAndPasskeys.email,
      isMfaActive: userAndPasskeys.isMfaActive,
    },
  });
};

// FIDO2設定リセット
export const resetFido2 = async (req: Request, res: Response) => {
  const user = req.user as User;
  if (user.isFido2Active === false)
    return res.status(400).json({ message: "FIDO2が設定されていません" });

  let deletePasskeysUser;
  try {
    await prisma.$transaction(async (tx) => {
      const userId = user.id;
      await prisma.passkey.deleteMany({
        where: { userId },
      });
      deletePasskeysUser = await tx.user.update({
        where: {
          id: userId,
        },
        data: { isFido2Active: false },
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "FIDO2設定の解除に失敗しました" });
  }

  res.clearCookie("jsappFido2", fido2CookieConfig);
  return res
    .status(200)
    .json({ message: "FIDO2設定を解除しました", user: deletePasskeysUser });
};

// ログイン画面でのFIDO2認証トリガー用
export const checkFido2Login = (req: Request, res: Response) => {
  const userId = req.signedCookies?.jsappFido2;
  return res.status(200).json({ fido2: userId !== undefined });
};
