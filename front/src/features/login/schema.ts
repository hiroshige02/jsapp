import { emailScheme, passwordScheme } from "@packages/shared";
import * as yup from "yup";
import { InferType } from "yup";

/**
 * ユーザーログイン用バリデーションロジック
 */
export const loginFormSchema = yup.object({
  email: emailScheme,
  password: passwordScheme,
});

export type LoginFormSchema = InferType<typeof loginFormSchema>;
