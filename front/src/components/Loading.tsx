import { FC } from "react";
import { Box, Center, Spinner } from "@chakra-ui/react";

const Loading: FC = () => {
  return (
    <>
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        backgroundColor="rgba(0, 0, 0, 0.3)"
        zIndex="9999"
        pointerEvents="auto"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner
          width="100px"
          height="100px"
          animationDuration="0.8s"
          color="gray"
          borderWidth="6px"
        />
      </Box>
    </>
  );
};

export default Loading;
