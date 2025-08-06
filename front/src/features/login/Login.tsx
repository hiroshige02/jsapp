import { FC } from "react";

import {
  Flex,
  Box,
  Field,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  Link,
  IconButton,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginFormSchema, LoginFormSchema } from "./schema";
import { useValidForm } from "@/lib/useValidForm";
import useApi from "@/lib/api";
import { errorFormat } from "@/lib/errorFormat";
import { useNavigate } from "react-router-dom";
import FormError from "@/components/FormError";
import { AuthContextType, AuthContext } from "@/providers/AuthProvider";
import {
  LoadingContextType,
  LoadingContext,
} from "@/providers/LoadingProvider";
import { messages } from "@packages/shared";

// パスワードログイン画面
const Login: FC = () => {
  const { setAuthUser }: AuthContextType = useContext(AuthContext);
  const { setLoading }: LoadingContextType = useContext(LoadingContext);
  const navigate = useNavigate();
  const { postMethod } = useApi();
  const [showPassword, setShowPassword] = useState(false);

  // バリデーション
  type ValuesKey = keyof LoginFormSchema;
  const defaultValues: LoginFormSchema = {
    email: "",
    password: "",
  };
  const { register, handleSubmit, errors, setError, clearErrors } =
    useValidForm<LoginFormSchema>(defaultValues, loginFormSchema);

  // フォーム送信
  const onSubmit: SubmitHandler<LoginFormSchema> = async (data) => {
    // ローディング開始、エラーのクリア
    setLoading(true);
    clearErrors();

    try {
      const res = await postMethod<LoginFormSchema>(data, "login", false);
      if (res.ok) {
        // 成功時の処理
        const resJson = await res.json();
        console.log("LOGIN resJson: ", resJson);

        setAuthUser(resJson.user);
        const nextRoot = resJson.totpRequire ? "/login_input_code" : "/home";

        resJson.totpRequire
          ? navigate("/login_input_code", { state: { fromLogin: true } })
          : navigate("/home");

        return;
      }

      if (res.status === 409) {
        const fieldErrors = res.errors.inner;
        const err = errorFormat(fieldErrors);
        err.map((field) =>
          setError(field["name"] as ValuesKey, {
            message: field["messages"],
          })
        );
      } else if (res.status === 401) {
        // 認証失敗
        setError("email", {});
        setError("password", { message: "ログインに失敗しました" });
      } else {
        // ローディング解除
        alert(messages.unexpectedError);
        console.log(res);
      }
    } catch (err) {
      alert(messages.serverError);
      console.log(err);
    } finally {
      // ローディング解除
      setLoading(false);
    }
  };

  return (
    <Flex align={"center"} justify={"center"} bg="gray.50">
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Log in
          </Heading>
        </Stack>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} action="#">
          <Box rounded={"lg"} bg="white" boxShadow={"lg"} p={8}>
            <Stack gap={4}>
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
                    maxLength={255}
                    type={showPassword ? "text" : "password"}
                    pr="3rem"
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
                  Log in
                </Button>
              </Stack>

              <Stack pt={6}>
                <Text>
                  Don't have an account?{" "}
                  <Link color={"blue.400"} href="/register">
                    Sign up
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

export default Login;
