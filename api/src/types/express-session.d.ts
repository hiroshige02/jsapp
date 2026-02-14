import _session from "express-session";

declare module "express-session" {
  interface SessionData {
    secret: string;
    registOptions: PublicKeyCredentialCreationOptionsJSON;
    authOptions: PublicKeyCredentialRequestOptionsJSON;
  }
}
