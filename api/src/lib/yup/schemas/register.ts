import {
  passwordScheme,
  lastNameScheme,
  firstNameScheme,
  passwordConfirmScheme,
} from "@packages/shared";

import extendEmailScheme from "../extendEmail";
import type { InferType } from "yup";
import * as yup from "yup";

export const registerFormSchema = yup.object({
  firstName: firstNameScheme,
  lastName: lastNameScheme,
  email: extendEmailScheme,
  password: passwordScheme,
  passwordConfirm: passwordConfirmScheme,
});

export type RegisterFormSchema = InferType<typeof registerFormSchema>;
