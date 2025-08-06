import * as yup from "yup";

export const lastNameScheme = yup
  .string()
  .max(100, "100文字以内で入力してください");
