import { Router, Response } from "express";
import passport from "passport";
import { validate } from "@/lib/yup/validate";
import {
  register,
  login,
  totpLogin,
  check,
} from "@/controllers/publicController";
import {
  generateFido2AuthOptions,
  fido2Login,
  checkFido2Login,
} from "@/controllers/fido2Controller";
import { registerFormSchema } from "@/lib/yup/schemas/register";
import { loginFormSchema } from "@/lib/yup/schemas/login";
import { codeSchema } from "@packages/shared";

const router = Router();

// ユーザー登録
router.post("/register", validate(registerFormSchema), register);

// パスワードログイン
router.post(
  "/login",
  validate(loginFormSchema),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate("local", { session: false }),
  login,
);

// TOTPコード認証
router.post("/totp_login", validate(codeSchema), totpLogin);

// FIDO2認証用オプション取得
router.post("/generate_fido2_auth_options", generateFido2AuthOptions);

// FIDO2認証
router.post("/fido2_login", fido2Login);

// 認証チェック
router.get(
  "/check",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate("jwt", { session: false }),
  check,
);

// ログイン画面でのFIDO2認証トリガー用
router.get("/check_fido2_login", checkFido2Login);

// ALBヘルスチェック用
router.get("/health", (_, res: Response) => res.sendStatus(200));

export default router;
