import * as yup from "yup";

export const emailScheme = yup
  .string()
  .required("必須項目です")
  .email("メールアドレスの形式ではありません")
  .max(255, "255文字以内で入力してください");
