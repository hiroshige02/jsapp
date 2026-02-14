import { User } from "@/providers/AuthContext";

export type SuccessUserJson = {
  message: string;
  user: User;
};
