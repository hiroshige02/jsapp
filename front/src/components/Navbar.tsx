// Simple with user dropdown

// "use client";

import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Portal,
  Button,
  Menu,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link as RouterLink } from "react-router-dom";
import useApi from "@/lib/api";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, AuthContextType } from "@/providers/AuthProvider";
import {
  LoadingContextType,
  LoadingContext,
} from "@/providers/LoadingProvider";
import { messages } from "@packages/shared";

interface Props {
  children: React.ReactNode;
}

const NavLink = (props: Props): React.ReactNode => {
  const { children } = props;

  return (
    <Box
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: "gray.200",
      }}
    >
      {children}
    </Box>
  );
};

export const Navbar = (): React.ReactNode => {
  const navigate = useNavigate();
  const { postMethod } = useApi();
  const { setAuthUser, authUser }: AuthContextType = useContext(AuthContext);
  const { setLoading }: LoadingContextType = useContext(LoadingContext);

  // ログアウト
  const logOut = async () => {
    // ローディング開始、エラーのクリア
    setLoading(true);
    try {
      const res = await postMethod<undefined>(undefined, "auth/logout");
      if (res.status !== 200) {
        alert(messages.serverError);
        return;
      }
      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(messages.serverError);
    } finally {
      setLoading(false);
    }
  };

  const { open, onOpen, onClose } = useDisclosure();
  const Links = [
    { text: "Home", linkTo: "/home", onClick: undefined },
    { text: "Logout", linkTo: "#", onClick: logOut },
    { text: "Auth Config", linkTo: "/auth_config", onClick: undefined },
  ];

  return (
    <>
      <Box bg="gray.100" px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            bgColor={"gray.100"}
            color="black"
            onClick={open ? onClose : onOpen}
          >
            {open ? <IoMdClose /> : <GiHamburgerMenu />}
          </IconButton>
          <HStack gap={8} alignItems={"center"}>
            <Box>JSAPP</Box>
            <HStack as={"nav"} gap={4} display={{ base: "none", md: "flex" }}>
              {Links.map((link, idx) => (
                <NavLink key={idx}>
                  <RouterLink to={link.linkTo} onClick={link.onClick}>
                    {link.text}
                  </RouterLink>
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Menu.Root>
              {authUser!.firstName}
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="">Link 1</Menu.Item>
                    <Menu.Item value="">Link 2</Menu.Item>
                    <Menu.Item value="">Link 3</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>
        </Flex>

        {open ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} gap={4}>
              {Links.map((link, idx) => (
                <NavLink key={idx}>
                  <RouterLink to={link.linkTo} onClick={link.onClick}>
                    {link.text}
                  </RouterLink>
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};
