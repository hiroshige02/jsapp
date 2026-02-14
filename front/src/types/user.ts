export type User = {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  password: string;
  isMfaActive: boolean;
  isFido2Active: boolean;
  twoFactorSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
};
