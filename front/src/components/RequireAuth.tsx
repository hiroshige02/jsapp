import { ReactNode, useContext, FC, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthContext, AuthContextType } from "@/providers/AuthProvider";

/**
 * 認証済ユーザー情報の取得状態、遷移先ルートで必要があればリダイレクトを行う
 */

type Props = {
  children: ReactNode;
};

const RequireAuth: FC<Props> = ({ children }) => {
  const { authUser, authChecking }: AuthContextType = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const excludePath = ["/login", "/login_input_code", "/register"];
  // 認証が必要なパス
  const needAuthPath = !excludePath.includes(currentPath);

  // サーバーに認証状態確認中
  if (authChecking) {
    return;
  }

  // 認証済でない時はログイン画面に戻る
  if (!authChecking && !authUser && needAuthPath) {
    return <Navigate to="/login" replace />;
  }
  // 認証済の時、ログイン画面とユーザー登録画面には遷移できない
  if (!authChecking && authUser && !needAuthPath) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default RequireAuth;
