// "use client";

// import Provider from "@/components/ui/provider";
// import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { Navbar } from "@/components/Navbar";
import { useLocation } from "react-router-dom";
import { ReactNode, useContext } from "react";
import { AuthContext } from "@/providers/AuthProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import { AuthContextType } from "@/providers/AuthProvider";
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
