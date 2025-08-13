import { Request } from "express";
import jwt from "jsonwebtoken";

// JWTペイロード取得
export const jwtVerify = (
  req: Request
): jwt.JwtPayload | string | undefined => {
  // ログイン中のユーザーのIDを取得
  const token = req.signedCookies?.token;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    console.error(error);
    return;
  }
};

// ログイン時のJWT token発行
export const loginJwtSign = (payload: { sub: number }) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1hr" }!);
};
