import {
  emailScheme,
  passwordScheme,
  lastNameScheme,
  firstNameScheme,
  passwordConfirmScheme,
} from "@packages/shared";
import * as yup from "yup";
import { InferType } from "yup";

/**
 * ユーザー登録用バリデーションロジック
 */
export const registerFormSchema = yup.object({
  firstName: firstNameScheme,
  lastName: lastNameScheme,
  email: emailScheme,
  password: passwordScheme,
  passwordConfirm: passwordConfirmScheme,
});

export type RegisterFormSchema = InferType<typeof registerFormSchema>;
