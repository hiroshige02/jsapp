import { useEffect, useState } from "react";
import { messages } from "@packages/shared";
import { User } from "@/providers/AuthContext";
import { useCallback } from "react";

/**
 * 認証済のユーザー情報管理、画面遷移ごとの認証状態チェック
 */
export const useCheckAuth = () => {
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<User | undefined>(undefined);

  const checkAuth = useCallback(async () => {
    // 認証チェック
    try {
      setAuthChecking(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/check`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 200) {
        const resJson = (await res.json()) as { user: User };
        const user = resJson.user;
        setAuthUser({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isMfaActive: user.isMfaActive,
          isFido2Active: user.isFido2Active,
        });
      } else if (res.status !== 200) {
        setAuthUser(undefined);
      }
    } catch (error) {
      alert(messages.serverError);
      console.log(error);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return { authUser, setAuthUser, authChecking, checkAuth };
};
