import * as yup from "yup";

export const firstNameScheme = yup
  .string()
  .required("必須項目です")
  .max(100, "100文字以内で入力してください");
