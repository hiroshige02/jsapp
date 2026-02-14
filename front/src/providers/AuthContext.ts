import { createContext } from "react";

export type User = {
  firstName: string;
  lastName: string | null;
  email: string;
  isMfaActive: boolean;
  isFido2Active: boolean;
};

export type AuthContextType = {
  authUser: User | undefined;
  setAuthUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  authChecking: boolean;
  checkAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  authUser: undefined,
  setAuthUser: () => {},
  authChecking: true,
  checkAuth: async () => {},
});
