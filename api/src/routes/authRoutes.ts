import { Router } from "express";
import passport from "passport";
import { validate } from "@/lib/yup/validate";
import {
  home,
  setup2FA,
  verify2FA,
  reset2FA,
} from "@/controllers/authController";
import { codeSchema } from "@packages/shared";

const router = Router();

// JWT tokenで認証
router.use(passport.authenticate("jwt", { session: false }));

// TOTPのQRコードを取得
router.post("/2fa/setup", setup2FA);

// TOTP認証してMFAを設定
router.post("/2fa/verify", validate(codeSchema), verify2FA);

// TOTPによるMFAを外す
router.post("/2fa/reset", reset2FA);

export default router;
