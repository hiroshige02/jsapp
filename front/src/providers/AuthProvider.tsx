import { createContext, ReactNode, FC } from "react";
import { useCheckAuth } from "@/hooks/useCheckAuth";

/**
 * 認証チェック用の関数、変数を子コンポーネントに渡す
 */

type User = {
  //   id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  isMfaActive: boolean;
  //   createdAt: Date;
  //   updatedAt: Date;
};

export type AuthContextType = {
  authUser: User | null;
  setAuthUser: React.Dispatch<React.SetStateAction<null>>;
  authChecking: boolean;
  checkAuth: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  authUser: null,
  setAuthUser: () => {},
  authChecking: true,
  checkAuth: () => {},
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
