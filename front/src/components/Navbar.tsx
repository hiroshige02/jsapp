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
  const { setAuthUser }: AuthContextType = useContext(AuthContext);
  const { setLoading }: LoadingContextType = useContext(LoadingContext);

  // ログアウト
  const logOut = async () => {
    // ローディング開始、エラーのクリア
    setLoading(true);
    const res = await postMethod<undefined>(undefined, "logout");
    const resJson = await res.json();
    if (!res.ok) {
      throw new Error(resJson.message);
    }

    setAuthUser(null);
    navigate("/login");

    setLoading(false);
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
                  <RouterLink to={link.linkTo} onClick={() => link.onClick}>
                    {link.text}
                  </RouterLink>
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  rounded={"full"}
                  variant={"ghost"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar.Root>
                    <Avatar.Image src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9" />
                  </Avatar.Root>
                </Button>
              </Menu.Trigger>

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
