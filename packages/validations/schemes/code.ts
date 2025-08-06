import * as yup from "yup";

export const codeSchema = yup
  .array()
  .typeError("不正な形式です")
  .length(6, "数字6桁を入力してください")
  .of(yup.string().matches(/^\d{1}$/, "数字1桁で入力してください"))
  .required("必須項目です");
