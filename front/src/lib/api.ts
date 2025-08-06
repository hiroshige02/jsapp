import { useContext, useCallback } from "react";
import type { Response } from "express";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContext, AuthContextType } from "@/providers/AuthProvider";

// APIアクセス用
const useApi = () => {
  const { setAuthUser }: AuthContextType = useContext(AuthContext);
  const navigate = useNavigate();

  const getMethod = useCallback(
    async (url: string, navigateToLogin: boolean = true): Response<any> => {
      const res = await fetch(`${process.env.VITE_API_BASE_URL}/${url}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401 && navigateToLogin) {
        setAuthUser(null);
        navigate("/login");
        return;
      }

      return res;
    },
    [setAuthUser, navigate]
  );

  const postMethod = useCallback(
    async <T>(
      data: T,
      url: string,
      navigateToLogin: boolean = true
    ): Promise<any> => {
      const res = await fetch(`${process.env.VITE_API_BASE_URL}/${url}`, {
        method: "POST",
        headers: {
          // Authorization: `Bearer ${token}`, // HTTP Only Cookieに格納のため不要
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (res.status === 401 && navigateToLogin) {
        setAuthUser(null);
        navigate("/login");
        return;
      }

      return res;
    },
    [setAuthUser, navigate]
  );

  return { getMethod, postMethod };
};

export default useApi;
