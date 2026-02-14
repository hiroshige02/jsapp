import AppRouter from "./routes/AppRouter";
import { Navbar } from "@/components/Navbar";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/providers/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import { FC } from "react";

const App: FC = () => {
  const currentPath = useLocation().pathname;
  // ログインユーザー
  const { authUser }: AuthContextType = useContext(AuthContext);

  return (
    <>
      {authUser && currentPath !== "/login" && <Navbar />}
      <RequireAuth>
        <AppRouter />
      </RequireAuth>
    </>
  );
};

export default App;
