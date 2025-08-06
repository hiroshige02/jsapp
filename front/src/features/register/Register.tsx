import { FC, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  Flex,
  Box,
  Field,
  Input,
  HStack,
  Stack,
  Button,
  Heading,
  Text,
  Link,
  IconButton,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SubmitHandler } from "react-hook-form";
import FormError from "@/components/FormError";
import useApi from "@/lib/api";
import { errorFormat } from "@/lib/errorFormat";
import { useValidForm } from "@/lib/useValidForm";
import { registerFormSchema, RegisterFormSchema } from "./schema";
import {
  LoadingContextType,
  LoadingContext,
} from "@/providers/LoadingProvider";
import { messages } from "@packages/shared";

// ユーザー登録
const Register: FC = () => {
  const { setLoading }: LoadingContextType = useContext(LoadingContext);
  const navigate = useNavigate();
  const { postMethod } = useApi();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConf, setShowPasswordConf] = useState<boolean>(false);

  const defaultValues: RegisterFormSchema = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  };

  type ValuesKey = keyof RegisterFormSchema;

  // バリデーション
  const { register, handleSubmit, errors, setError, clearErrors } =
    useValidForm<RegisterFormSchema>(defaultValues, registerFormSchema);

  // フォーム送信
  const onSubmit: SubmitHandler<RegisterFormSchema> = async (data) => {
    // ローディング開始、エラーのクリア
    setLoading(true);
    clearErrors();

    try {
      // フォーム送信
      const res = await postMethod<RegisterFormSchema>(data, "register");
      const resJson = await res.json();

      if (res.ok) {
        // 成功時の処理
        navigate("/login");
        return;
      }

      if (!resJson.errors || !resJson.errors.inner) {
        // バリデーションエラー以外の失敗
        alert(messages.unexpectedError);
        console.log(resJson);
        return;
      }

      // バリデーションエラー表示処理
      const fieldErrors = resJson.errors.inner;
      const err = errorFormat(fieldErrors);
      err.map((field) =>
        setError(field["name"] as ValuesKey, {
          message: field["messages"],
        })
      );
    } catch (err) {
      alert(messages.serverError);
      console.log(err);
    } finally {
      // ローディング解除
      setLoading(false);
    }
  };

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg="gray.50">
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <Box rounded={"lg"} bg="white" boxShadow={"lg"} p={8}>
            <Stack gap={4}>
              <HStack>
                <Box>
                  <Field.Root
                    id="firstName"
                    required
                    invalid={errors.firstName !== undefined}
                  >
                    <Field.Label>
                      First Name
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="text"
                      maxLength={100}
                      {...register("firstName")}
                    />
                    <Field.ErrorText>
                      {errors.firstName?.message && (
                        <FormError messages={errors.firstName.message} />
                      )}
                    </Field.ErrorText>
                  </Field.Root>
                </Box>
                <Box>
                  <Field.Root
                    id="lastName"
                    invalid={errors.lastName !== undefined}
                  >
                    <Field.Label>Last Name</Field.Label>
                    <Input
                      type="text"
                      maxLength={100}
                      {...register("lastName")}
                    />
                    {errors.lastName?.message && (
                      <FormError messages={errors.lastName.message} />
                    )}
                  </Field.Root>
                </Box>
              </HStack>
              <Field.Root
                id="email"
                required
                invalid={errors.email !== undefined}
              >
                <Field.Label>
                  Email address
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input type="email" maxLength={255} {...register("email")} />
                {errors.email?.message && (
                  <FormError messages={errors.email.message} />
                )}
              </Field.Root>

              <Field.Root
                id="password"
                required
                invalid={errors.password !== undefined}
              >
                <Field.Label>
                  Password
                  <Field.RequiredIndicator />
                </Field.Label>
                <Box position="relative" display="inline-block" width="100%">
                  <Input
                    type={showPassword ? "text" : "password"}
                    pr="3rem"
                    maxLength={255}
                    {...register("password")}
                  />
                  <IconButton
                    variant={"ghost"}
                    position="absolute"
                    right="0%"
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </IconButton>
                </Box>
                {errors.password?.message && (
                  <FormError messages={errors.password.message} />
                )}
              </Field.Root>

              <Field.Root
                id="password-confirm"
                required
                invalid={errors.passwordConfirm !== undefined}
              >
                <Field.Label>
                  Password confirm
                  <Field.RequiredIndicator />
                </Field.Label>
                <Box position="relative" display="inline-block" width="100%">
                  <Input
                    type={showPasswordConf ? "text" : "password"}
                    pr="3rem"
                    {...register("passwordConfirm")}
                    onPaste={(e) => e.preventDefault()}
                  />
                  <IconButton
                    variant={"ghost"}
                    position="absolute"
                    right="0"
                    onClick={() =>
                      setShowPasswordConf(
                        (showPasswordConf) => !showPasswordConf
                      )
                    }
                  >
                    {showPasswordConf ? <FaEye /> : <FaEyeSlash />}
                  </IconButton>
                </Box>
                {errors.passwordConfirm?.message && (
                  <FormError messages={errors.passwordConfirm.message} />
                )}
              </Field.Root>

              <Stack gap={10} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  type="submit"
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text>
                  Already a user?{" "}
                  <Link color={"blue.400"} href="/login">
                    Login
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </Box>
        </form>
      </Stack>
    </Flex>
  );
};

export default Register;
