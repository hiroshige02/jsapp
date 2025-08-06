import * as yup from "yup";

export const passwordScheme = yup
  .string()
  .required("必須項目です")
  .max(255, "255文字以内で入力してください");
