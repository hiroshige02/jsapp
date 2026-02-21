import { FC, useCallback } from "react";

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
import { useState, useContext, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SubmitHandler } from "react-hook-form";
import { loginFormSchema, LoginFormSchema } from "./schema";
import { useValidForm } from "@/lib/useValidForm";
import useApi from "@/lib/api";
import { errorFormat } from "@/lib/errorFormat";
import { useNavigate, NavLink } from "react-router-dom";
import FormError from "@/components/FormError";
import { AuthContextType, AuthContext } from "@/providers/AuthContext";
import { LoadingContextType, LoadingContext } from "@/providers/LoagindContext";
import { messages } from "@packages/shared";
import {
  startAuthentication,
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { LoginSuccessJson } from "./types";
import { ErrorResponse, ValidationErrorResponse } from "@/types/response";
import { User } from "@/providers/AuthContext";

// パスワードログイン画面
const Login: FC = () => {
  const { setAuthUser }: AuthContextType = useContext(AuthContext);
  const { setLoading }: LoadingContextType = useContext(LoadingContext);
  const navigate = useNavigate();
  const { postMethod, getMethod } = useApi();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showFido2, setShowFido2] = useState<boolean>(false);

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
        const successResponse = (await res.json()) as LoginSuccessJson;

        // 成功時の処理
        setAuthUser(successResponse.user);
        if (successResponse.totpRequire) {
          await navigate("/login_input_code", { state: { fromLogin: true } });
        } else {
          await navigate("/home");
        }
        return;
      }

      if (res.status === 409) {
        const errorJson = (await res.json()) as ValidationErrorResponse;
        const fieldErrors = errorJson.errors.inner;
        const err = errorFormat(fieldErrors);

        err.map((field) =>
          setError(field["name"] as ValuesKey, {
            message: field["messages"],
          }),
        );
      } else if (res.status === 401) {
        // 認証失敗
        setError("email", {});
        setError("password", { message: "ログインに失敗しました" });
      } else {
        alert(messages.serverError);
        console.log(res);
      }
    } catch (err) {
      alert(messages.unexpectedError);
      console.log(err);
    } finally {
      // ローディング解除
      setLoading(false);
    }
  };

  // FIDO2ログイン
  const fido2Login = async () => {
    // ローディング開始、エラーのクリア
    setLoading(true);
    clearErrors();

    const supportMessage =
      "\nFIDO2認証がうまくいかない場合、パスワードとTOTPで認証してください";

    try {
      const resp = await postMethod<undefined>(
        undefined,
        "generate_fido2_auth_options",
      );

      const respJson = (await resp.json()) as
        | ErrorResponse
        | PublicKeyCredentialRequestOptionsJSON;
      if (!resp.ok || !("options" in respJson)) {
        alert((respJson as ErrorResponse).message);
        return;
      }

      const options = respJson.options as PublicKeyCredentialRequestOptionsJSON;
      const authResp = await startAuthentication({
        optionsJSON: options,
      });

      const result = await postMethod<AuthenticationResponseJSON>(
        authResp,
        "fido2_login",
      );

      const resultJson = (await result.json()) as
        | ErrorResponse
        | { user: User };

      if (!result.ok) {
        alert((resultJson as ErrorResponse).message + supportMessage);
        return;
      }

      setAuthUser((resultJson as { user: User }).user);
      await navigate("/home");
    } catch (error) {
      console.error(error);
      alert(messages.serverError + supportMessage);
    } finally {
      setLoading(false);
    }
  };

  // FIDO2ログインが可能か
  const tryCheckFido2Login = useCallback(async () => {
    try {
      const res = await getMethod("check_fido2_login");
      const resJson = (await res.json()) as { fido2: boolean };
      if (!resJson.fido2) return;
      setShowFido2(true);
    } catch (error) {
      console.log(error);
      alert(messages.serverError);
    }
    // fido2Login(); // TODO: FIDO2ログインのルート表示だけにするか、自動でFIDO2ログインさせるか
  }, [getMethod]);

  useEffect(() => {
    void tryCheckFido2Login();
  }, [tryCheckFido2Login]);

  return (
    <Flex align={"center"} justify={"center"} bg="gray.50">
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Log in
          </Heading>
        </Stack>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} action="#">
          {/* Chromeのautocomplete対策 */}
          <input
            type="email"
            name="dummy-user-name"
            autoComplete="dummy-username"
            style={{ display: "none" }}
          />
          <input
            type="password"
            name="dummy-password"
            autoComplete="new-password"
            style={{ display: "none" }}
          />

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

              <Stack gap={3}>
                <Text>
                  Don't have an account?{" "}
                  <NavLink to="/register">
                    <Text as="span" color={"blue.400"}>
                      Sign up
                    </Text>
                  </NavLink>
                </Text>

                {showFido2 && (
                  <Text>
                    Login with FIDO2 ?{" "}
                    <Link color={"blue.400"} onClick={() => void fido2Login()}>
                      Sign in
                    </Link>
                  </Text>
                )}
              </Stack>
            </Stack>
          </Box>
        </form>
      </Stack>
    </Flex>
  );
};

export default Login;
