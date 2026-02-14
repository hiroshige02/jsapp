import { FC, useCallback } from "react";

import { Flex, Box, Stack, Button, Heading } from "@chakra-ui/react";
import { useState, useEffect, useContext } from "react";
import useApi from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { LoadingContextType, LoadingContext } from "@/providers/LoagindContext";
import { messages } from "@packages/shared";
import { ErrorResponse } from "@/types/response";

type GetQRCodeSuccessJson = { QRCode: string };
const TOTPSetup: FC = () => {
  const { setLoading }: LoadingContextType = useContext(LoadingContext);
  const { postMethod } = useApi();
  const navigate = useNavigate();
  const [QRCodeDisplay, setQRCodeDisplay] = useState<string>("");

  // TOTPのQRコード表示
  const getQRCode = useCallback(async () => {
    setLoading(true);
    try {
      // QRCode取得
      const res = await postMethod<undefined>(undefined, "auth/2fa/setup");
      const resJson = (await res.json()) as
        | GetQRCodeSuccessJson
        | ErrorResponse;

      if (res.ok) {
        const successJson = resJson as GetQRCodeSuccessJson;
        setQRCodeDisplay(successJson.QRCode);
        return;
      }
      const errorJson = resJson as ErrorResponse;
      alert(errorJson.message);
    } catch (err) {
      alert(messages.serverError);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [postMethod, setLoading]);

  useEffect(() => {
    void getQRCode();
  }, [getQRCode]);

  return (
    <Flex align={"center"} justify={"center"} bg="gray.50">
      <Stack gap={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Scan TOTP QRCode
          </Heading>
        </Stack>
        {QRCodeDisplay && (
          <img
            src={QRCodeDisplay}
            alt="Generated QR Code"
            style={{ marginTop: "20px" }}
          />
        )}
        <Box rounded={"lg"} bg="white" boxShadow={"lg"} p={8}>
          <Stack gap={4}>
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
                onClick={() => void navigate("/input_code")}
              >
                Activate TOTP
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default TOTPSetup;
