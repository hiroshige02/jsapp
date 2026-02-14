import { ReactNode, FC } from "react";
import { useCheckAuth } from "@/hooks/useCheckAuth";
import { AuthContext } from "./AuthContext";

/**
 * 認証チェック用の関数、変数を子コンポーネントに渡す
 */
export const AuthProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { authUser, setAuthUser, authChecking, checkAuth } = useCheckAuth();

  const value = {
    authUser,
    setAuthUser,
    authChecking,
    checkAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
