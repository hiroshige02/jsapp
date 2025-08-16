import {
  FC,
  RefObject,
  useState,
  useRef,
  createRef,
  useContext,
  ChangeEvent,
  useEffect,
  KeyboardEvent,
} from "react";

import {
  Flex,
  Box,
  Field,
  Input,
  Stack,
  Button,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ValidationError } from "yup";
import { eachError, allError } from "@/lib/errorFormat";
import useApi from "@/lib/api";
import { codeSchema } from "@packages/shared";
import { InferType } from "yup";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { AuthContext, AuthContextType } from "@/providers/AuthProvider";
import {
  LoadingContextType,
  LoadingContext,
} from "@/providers/LoadingProvider";
import { messages } from "@packages/shared";

// TOTPコード認証画面

type CodeSchema = InferType<typeof codeSchema>;

const InputCode: FC = () => {
  const { setAuthUser }: AuthContextType = useContext(AuthContext);
  const { setLoading }: LoadingContextType = useContext(LoadingContext);
  const initialCode: CodeSchema = Array(6).fill("");
  const [codes, setCodes] = useState<CodeSchema>(initialCode);
  const [toLogin, setToLogin] = useState<boolean>(false);
  const [error, setError] = useState<allError>([]);
  const { postMethod } = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // MFAログイン時の遷移か、TOTP設定時の遷移か
    setToLogin(location.pathname === "/login_input_code");
    // ログイン時はURL直打ちでの遷移は許可しない。パスワード認証後の遷移のみ
    if (toLogin && !location.state?.fromLogin) {
      navigate("/login");
    }
  }, []);

  // コード入力用部品用
  const inputRefs = useRef<RefObject<HTMLInputElement | null>[]>(
    Array.from({ length: 6 }, () => createRef<HTMLInputElement>())
  );

  // const isNumeric = (newVal: string) => newVal.match(/^[0-9]{1}$/);
  const isNumeric = (newVal: string) => /^[0-9]$/.test(newVal);

  // 入力にともなうカーソル位置等の調整
  const onKeyUp = (key: number, e: KeyboardEvent) => {
    const keyType = e.key;

    if (keyType === "Backspace") {
      inputRefs.current[key - 1]?.current?.focus();
      setCodes((prev) => {
        const updated = [...prev];
        updated[key] = "";
        return updated;
      });
      return;
    } else if (keyType === "ArrowLeft") {
      inputRefs.current[key - 1]?.current?.focus();
      return;
    } else if (keyType === "ArrowRight") {
      inputRefs.current[key + 1]?.current?.focus();
      return;
    }

    // その他 数字以外の入力
    if (isNumeric(keyType) === false) return;

    // 数字の入力
    inputRefs.current[key + 1]?.current?.focus();
    setCodes((prev) => {
      const updated = [...prev];
      updated[key] = keyType;
      return updated;
    });
  };

  const onChange = (key: number, e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    console.log("newVal: ", newVal, isNumeric(newVal) === false);
    if (isNumeric(newVal) === false) return;

    setCodes((prev) => {
      const updated = [...prev];
      updated[key] = newVal;
      return updated;
    });
  };

  const handleError = (err: any) => {
    if (!err.errors || !err.errors.inner) {
      // バリデーションエラー以外の失敗
      setLoading(false);
      console.log(err);
      alert(messages.unexpectedError);
      return;
    }

    // バリデーションエラーをセット
    const errorBox: allError = [];
    const fieldErrors: ValidationError[] = err.errors.inner;
    for (let i = 0; i < fieldErrors.length; i++) {
      const idx = (fieldErrors[i]["path"] as string).replace(/[\[\]]/g, "");
      const index = idx === "" ? "" : `${Number(idx) + 1}番目`;

      errorBox.push({
        name: fieldErrors[i]["path"],
        messages: index + " " + fieldErrors[i]["message"],
      } as eachError);
    }

    setError(errorBox);
    setLoading(false);
  };

  // 認証コード送信
  const onSubmit = async () => {
    // ローディング開始、エラーのクリア
    setLoading(true);
    setError([]);

    try {
      await codeSchema.validate(codes, {
        abortEarly: false,
      });

      const apiUrl = toLogin ? "totp_login" : "auth/2fa/verify";
      const redirectUrl = toLogin ? "/home" : "/auth_config";

      // 入力コード送信
      const res = await postMethod<CodeSchema>(codes, apiUrl);
      const resJson = await res.json();

      if (res.ok) {
        setAuthUser(resJson.user);
        if (!toLogin) {
          // TOTP設定時
          alert(resJson.message);
        }
        navigate(redirectUrl);
        return;
      }

      if (res.status === 400) {
        setError([
          {
            name: "",
            messages: resJson.message,
          } as eachError,
        ]);
      } else if (res.status === 500) {
        alert(resJson.message);
        navigate(toLogin ? "/login" : "/input_code");
      } else {
        handleError(resJson);
      }
    } catch (err: any) {
      // フロントのバリデーションエラーはここに入る
      if (err instanceof ValidationError) {
        err = {
          errors: { inner: err.inner },
        };
      }
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align={"center"} justify={"center"} bg="gray.50">
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Confirm code
          </Heading>
        </Stack>
        <Box rounded={"lg"} bg="white" boxShadow={"lg"} p={8}>
          <Stack gap={4}>
            <HStack gap={2}>
              {codes.map((value, key) => (
                <Field.Root
                  key={`code_${key}`}
                  invalid={
                    !!error.find(
                      (er) => er.name === "[" + key + "]" || er.name === ""
                    )
                  }
                >
                  <Input
                    maxLength={1}
                    ref={inputRefs.current[key]}
                    width={"40px"}
                    key={Number(key)}
                    value={value ?? ""}
                    onChange={(e) => onChange(key, e)}
                    onKeyUp={(e) => onKeyUp(key, e)}
                    autoComplete="off"
                  />
                </Field.Root>
              ))}
            </HStack>
            {error &&
              error.map((er, idx) => (
                <Text textStyle="xs" color="red.500" pt="0" key={idx}>
                  {er.messages}
                </Text>
              ))}

            <Stack gap={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={() => onSubmit()}
              >
                Confirm code
              </Button>
            </Stack>
            {!toLogin && (
              <Stack pt={6}>
                <Text>
                  Need to scan the QRCode again?{" "}
                  <RouterLink to="/totp_setup">
                    <Box as="span" color={"blue.400"}>
                      TOTP setup
                    </Box>
                  </RouterLink>
                </Text>
              </Stack>
            )}
            {toLogin && (
              <Stack pt={6}>
                <Text>
                  <RouterLink to="/login">
                    <Box as="span" color={"blue.400"}>
                      Return to Log in?{" "}
                    </Box>
                  </RouterLink>
                </Text>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default InputCode;
