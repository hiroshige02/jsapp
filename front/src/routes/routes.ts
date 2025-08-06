import Home from "@/features/home/Home";
import Register from "@/features/register/Register";
import Login from "@/features/login/Login";
import InputCode from "@/features/input_code/InputCode";
import AuthConfig from "@/features/auth_config/AuthConfig";
import type { FC } from "react";
import TOTPSetup from "@/features/totp_setup/TOTPSetup";

type Route = {
  path: string;
  Page: FC;
};

export const routes: Route[] = [
  {
    path: "/home",
    Page: Home,
  },
  {
    path: "/login",
    Page: Login,
  },
  {
    path: "/login_input_code",
    Page: InputCode,
  },

  {
    path: "/input_code",
    Page: InputCode,
  },
  {
    path: "/register",
    Page: Register,
  },
  {
    path: "/auth_config",
    Page: AuthConfig,
  },
  {
    path: "/totp_setup",
    Page: TOTPSetup,
  },
] as const;
