import * as yup from "yup";

export const passwordConfirmScheme = yup
  .string()
  .required("必須項目です")
  .oneOf([yup.ref("password")], "passwordと一致しません。");
