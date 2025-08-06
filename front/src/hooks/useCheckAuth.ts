import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { messages } from "@packages/shared";

/**
 * 認証済のユーザー情報管理、画面遷移ごとの認証状態チェック
 */
export const useCheckAuth = () => {
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState(null);

  const location = useLocation();

  const checkAuth = async () => {
    // 認証チェック
    try {
      setAuthChecking(true);
      const res = await fetch(`${process.env.VITE_API_BASE_URL}/check`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        console.log(location.pathname);
        setAuthUser(null);
      }
    } catch (error) {
      alert(messages.serverError);
      console.log(error);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  return { authUser, setAuthUser, authChecking, checkAuth };
};
