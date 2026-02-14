import { useContext, FC } from "react";
import { Flex, Box, Stack, Button, Heading, Field } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useApi from "@/lib/api";
import { LoadingContextType, LoadingContext } from "@/providers/LoagindContext";
import { messages } from "@packages/shared";
import {
  startRegistration,
  RegistrationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import { AuthContext, AuthContextType } from "@/providers/AuthContext";
import FormError from "@/components/FormError";
import { ErrorResponse } from "@/types/response";
import { SuccessUserJson } from "./types";

const AuthConfig: FC = () => {
  const { setLoading }: LoadingContextType = useContext(LoadingContext);
  const { authUser, setAuthUser }: AuthContextType = useContext(AuthContext);
  const navigate = useNavigate();
  const { postMethod } = useApi();

  const TOTPReset = async () => {
    setLoading(true);

    try {
      const res = await postMethod<undefined>(undefined, "auth/2fa/reset");
      const resJson = (await res.json()) as ErrorResponse | SuccessUserJson;

      if (res.ok) {
        // 成功時の処理
        const successJson = resJson as SuccessUserJson;
        alert(successJson.message);
        setAuthUser(successJson.user);
        return;
      }
      alert(resJson.message);
    } catch (err) {
      alert(messages.serverError);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // FIDO2設定
  const setupFIDO2 = async () => {
    setLoading(true);

    try {
      const resp = await postMethod<undefined>(
        undefined,
        "auth/generate_fido2_regist_options",
      );
      const respJson = (await resp.json()) as
        | { options: PublicKeyCredentialCreationOptionsJSON }
        | ErrorResponse;

      console.log(respJson);

      if (!resp.ok) {
        alert((respJson as ErrorResponse).message);
        return;
      }

      const options = (
        respJson as { options: PublicKeyCredentialCreationOptionsJSON }
      ).options;
      const regResp = await startRegistration({
        optionsJSON: options,
      });

      const result = await postMethod<RegistrationResponseJSON>(
        regResp,
        "auth/verify_fido2",
      );
      const resultJson = (await result.json()) as
        | ErrorResponse
        | SuccessUserJson;
      alert(resultJson.message);

      if (!result.ok) return;
      setAuthUser((resultJson as SuccessUserJson).user);
    } catch (error) {
      console.log(error);
      alert(messages.fide2RegisterFailed);
    } finally {
      setLoading(false);
    }
  };

  // FIDO2設定リセット
  const FIDO2Reset = async () => {
    setLoading(true);

    try {
      const res = await postMethod<undefined>(undefined, "auth/reset_fido2");
      const resJson = (await res.json()) as ErrorResponse | SuccessUserJson;

      if (res.ok) {
        // 成功時の処理
        const successJson = resJson as SuccessUserJson;
        alert(successJson.message);
        setAuthUser(successJson.user);
        return;
      }
      alert(resJson.message);
    } catch (err) {
      alert(messages.serverError);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align={"center"} justify={"center"} bg="gray.50">
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Auth Config
          </Heading>
        </Stack>

        <Box
          rounded={"lg"}
          bg="white"
          boxShadow={"lg"}
          p={8}
          minWidth={"250px"}
        >
          <Stack>
            <Stack pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                disabled={authUser?.isMfaActive}
                onClick={() => void navigate("/totp_setup")}
              >
                TOTP Setup
              </Button>
            </Stack>
            <Stack gap={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                disabled={authUser?.isFido2Active || !authUser?.isMfaActive}
                onClick={() => {
                  void TOTPReset();
                }}
              >
                TOTP Reset
              </Button>
            </Stack>
            {authUser?.isFido2Active && (
              <Field.Root id="firstName" required invalid={true}>
                <Field.ErrorText>
                  <FormError messages="FIDO2の設定中はTOTPの設定を解除できません" />
                </Field.ErrorText>
              </Field.Root>
            )}
          </Stack>
        </Box>

        <Box rounded={"lg"} bg="white" boxShadow={"lg"} p={8}>
          <Stack>
            <Stack gap={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                disabled={!authUser?.isMfaActive || authUser.isFido2Active}
                onClick={() => {
                  void setupFIDO2();
                }}
              >
                FIDO2 Setup
              </Button>
            </Stack>

            <Stack gap={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                disabled={!authUser?.isFido2Active}
                onClick={() => {
                  void FIDO2Reset();
                }}
              >
                FIDO2 Reset
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default AuthConfig;
