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
import { useState, useContext, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginFormSchema, LoginFormSchema } from "./schema";
import { useValidForm } from "@/lib/useValidForm";
import useApi from "@/lib/api";
import { errorFormat } from "@/lib/errorFormat";
import { useNavigate, NavLink } from "react-router-dom";
import FormError from "@/components/FormError";
import { AuthContextType, AuthContext } from "@/providers/AuthProvider";
import {
  LoadingContextType,
  LoadingContext,
} from "@/providers/LoadingProvider";
import { messages } from "@packages/shared";
import {
  startAuthentication,
  AuthenticationResponseJSON,
} from "@simplewebauthn/browser";

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
        // 成功時の処理
        const resJson = await res.json();
        console.log("LOGIN resJson: ", resJson);
        setAuthUser(resJson.user);
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

  // FIDO2ログイン
  const fido2Login = async () => {
    // ローディング開始、エラーのクリア
    setLoading(true);
    clearErrors();

    try {
      const resp = await postMethod<undefined>(
        undefined,
        "generate_fido2_auth_options"
      );
      const respJson = await resp.json();
      if (!resp.ok) {
        alert(respJson.message);
        return;
      }

      const options = respJson.options;
      const authResp = await startAuthentication({ optionsJSON: options });
      const result = await postMethod<AuthenticationResponseJSON>(
        authResp,
        "fido2_login"
      );

      const resultJson = await result.json();
      // console.log("After verify: ", resultJson);
      if (!result.ok) {
        alert(resultJson.message);
        return;
      }

      setAuthUser(resultJson.user);
      navigate("/home");
    } catch (error) {
      console.log(error);
      alert(messages.serverError);
    } finally {
      setLoading(false);
    }
  };

  // FIDO2ログインが可能か
  const tryFido2Login = async () => {
    try {
      const res = await getMethod("check_fido2_login");
      const resJson = await res.json();
      if (!resJson.fido2) return;

      setShowFido2(true);
      // fido2Login(); // TODO: FIDO2ログインのルート表示だけにするか、自動でFIDO2ログインさせるか
    } catch (error) {
      alert(messages.serverError);
    }
  };

  useEffect(() => {
    tryFido2Login();
  }, []);

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
                    <Link color={"blue.400"} onClick={() => fido2Login()}>
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
