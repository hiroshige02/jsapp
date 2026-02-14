import { User } from "@/providers/AuthContext";

export type LoginSuccessJson = {
  message: string;
  totpRequire: boolean;
  user: User | undefined;
};
