import { FC, useContext } from "react";
import { Flex, Box, Stack, Button, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import useApi from "@/lib/api";
import {
  LoadingContextType,
  LoadingContext,
} from "@/providers/LoadingProvider";
import { messages } from "@packages/shared";

const AuthConfig: FC = () => {
  const { setLoading }: LoadingContextType = useContext(LoadingContext);
  const navigate = useNavigate();
  const { postMethod } = useApi();

  const TOTPReset = async () => {
    setLoading(true);

    try {
      const res = await postMethod<undefined>(undefined, "auth/2fa/reset");
      const resJson = await res.json();

      if (res.ok) {
        // 成功時の処理
        alert(resJson.message);
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
          <Text fontSize={"lg"} color={"gray.600"}>
            please setup TOTP authentication
          </Text>
        </Stack>
        <Box rounded={"lg"} bg="white" boxShadow={"lg"} p={8}>
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
                onClick={() => void navigate("/totp_setup")}
              >
                TOTP Setup
              </Button>
              <Stack gap={10} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  onClick={() => TOTPReset()}
                >
                  TOTP Reset
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default AuthConfig;
