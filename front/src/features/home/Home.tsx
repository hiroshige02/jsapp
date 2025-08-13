import { FC, useContext } from "react";
import { AuthContext, AuthContextType } from "@/providers/AuthProvider";
import { Box, Text } from "@chakra-ui/react";

const Home: FC = () => {
  const { authUser }: AuthContextType = useContext(AuthContext);

  return (
    <Box p={2}>
      <Text>{authUser?.firstName}'s HOME</Text>
    </Box>
  );
};

export default Home;
