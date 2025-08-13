import { createContext, ReactNode, FC } from "react";
import { useCheckAuth } from "@/hooks/useCheckAuth";

/**
 * 認証チェック用の関数、変数を子コンポーネントに渡す
 */

export type User = {
  firstName: string;
  lastName: string | null;
  email: string;
  isMfaActive: boolean;
  isFido2Active: boolean;
};

export type AuthContextType = {
  authUser: User | null;
  setAuthUser: React.Dispatch<React.SetStateAction<User | null>>;
  authChecking: boolean;
  checkAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  authUser: null,
  setAuthUser: () => {},
  authChecking: true,
  checkAuth: async () => {},
});

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
