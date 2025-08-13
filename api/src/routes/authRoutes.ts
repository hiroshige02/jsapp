import { Router } from "express";
import passport from "passport";
import { validate } from "@/lib/yup/validate";
import {
  setup2FA,
  verify2FA,
  reset2FA,
  logout,
} from "@/controllers/authController";
import { codeSchema } from "@packages/shared";
import {
  generateFido2RegistOptions,
  verifyFido2,
  resetFido2,
} from "@/controllers/fido2Controller";

const router = Router();

// JWT tokenで認証
router.use(passport.authenticate("jwt", { session: false }));

// TOTPのQRコードを取得
router.post("/2fa/setup", setup2FA);

// TOTP認証してMFAを設定
router.post("/2fa/verify", validate(codeSchema), verify2FA);

// TOTP設定リセット
router.post("/2fa/reset", reset2FA);

// FIDO2登録用オプション取得
router.post("/generate_fido2_regist_options", generateFido2RegistOptions);

// FIDO2認証・設定
router.post("/verify_fido2", verifyFido2);

// FIDO2設定リセット
router.post("/reset_fido2", resetFido2);

// FIDO2設定リセット
router.post("/reset_fido2", resetFido2);

// ログアウト
router.post("/logout", logout);

export default router;
