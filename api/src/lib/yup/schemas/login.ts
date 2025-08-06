import { emailScheme, passwordScheme } from "@packages/shared";
import * as yup from "yup";

export const loginFormSchema = yup.object({
  email: emailScheme,
  password: passwordScheme,
});
