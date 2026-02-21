import { useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, AuthContextType } from "@/providers/AuthContext";

// APIアクセス用
const useApi = () => {
  const { setAuthUser }: AuthContextType = useContext(AuthContext);
  const navigate = useNavigate();

  const getMethod = useCallback(
    async (url: string, navigateToLogin: boolean = true): Promise<Response> => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${url}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401 && navigateToLogin) {
        setAuthUser(undefined);
        throw new Error("unauthorized. redirect to login.");
      }

      return res;
    },
    [setAuthUser],
  );

  const postMethod = useCallback(
    async <T>(
      data: T,
      url: string,
      navigateToLogin: boolean = true,
    ): Promise<Response> => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${url}`, {
        method: "POST",
        headers: {
          // Authorization: `Bearer ${token}`, // HTTP Only Cookieに格納のため不要
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (res.status === 401 && navigateToLogin) {
        setAuthUser(undefined);
        await navigate("/login");
        console.log("UNAUTHORIZED");
        throw new Error("unauthorized. redirect to login.");
      }

      return res;
    },
    [setAuthUser, navigate],
  );

  return { getMethod, postMethod };
};

export default useApi;
