// TODO: 散らかってるので整理する
// undefinedの可能性は残した方がいいのか？
export type SignedCookies = {
  jsappFido2?: string;
  // tmpToken?: string;
  token?: string;
};

export type VerifyTmpCookie = {
  tmpToken?: string;
};

export type VerifyCookie = {
  token: string;
};
