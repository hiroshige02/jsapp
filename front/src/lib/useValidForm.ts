import { DefaultValues, useForm, FieldValues } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ObjectSchema } from "yup";

/**
 * フォームバリデーション
 */
export const useValidForm = <T extends FieldValues>(
  defaultValues: DefaultValues<T>,
  formSchema: ObjectSchema<any>
) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<T>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: yupResolver(formSchema),
  });

  return {
    register,
    handleSubmit,
    errors,
    setError,
    clearErrors,
  };
};
