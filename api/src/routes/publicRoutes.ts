import { Router } from "express";
import passport from "passport";
import { validate } from "@/lib/yup/validate";
import {
  register,
  login,
  totpLogin,
  check,
  logout,
} from "@/controllers/publicController";
import { registerFormSchema } from "@/lib/yup/schemas/register";
import { loginFormSchema } from "@/lib/yup/schemas/login";

const router = Router();

// ユーザー登録
router.post("/register", validate(registerFormSchema), register);

// パスワードログイン
router.post(
  "/login",
  validate(loginFormSchema),
  passport.authenticate("local", { session: false }),
  login
);

// TOTPコード認証
router.post("/totp_login", totpLogin);

// 認証チェック
router.get("/check", passport.authenticate("jwt", { session: false }), check);

// ログアウト
router.post("/logout", logout);

export default router;
