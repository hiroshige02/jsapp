import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { verify } from "argon2";
import { Strategy as JWTStrategy, StrategyOptions } from "passport-jwt";
import { CookieOptions } from "express";
import { findUserByEmail, findUser } from "@/lib/prismaUser";
import { SignedCookies } from "@/types/signedCookies";
import { Request } from "express";
import { JwtPayload } from "@/types/JWT";

// パスワードログイン用
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    void (async () => {
      try {
        console.log("EMAIL: " + email);
        console.log("PASSWORD: " + password);
        const user = await findUserByEmail(email);
        console.log("USER: ", user);

        if (!user || !(await verify(user.password, password))) {
          console.log("LOGIN FAILED");
          return done(null, false, { message: " Login failed" }); // ログイン失敗
        } else {
          console.log("PASSPORT LOGIN SUCCESS");

          const userInfo = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isMfaActive: user.isMfaActive,
            isFido2Active: user.isFido2Active,
            twoFactorSecret: user.twoFactorSecret,
          };
          return done(null, userInfo);
        } // 成功
      } catch (error) {
        console.log("LOGIN CATCH ERROR");

        return done(error);
      }
    })();
  }),
);

// 認証用のJWT tokenはCookieから取得
const cookieExtractor = (req: Request) => {
  const cookies = req.signedCookies as SignedCookies;
  return cookies.token ? cookies.token : null;
};

const opts: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET!,
};

// JWT tokenログイン用
passport.use(
  new JWTStrategy(opts, (jwtPayload, done) => {
    void (async () => {
      try {
        const user = await findUser((jwtPayload as JwtPayload).sub);

        if (!user) {
          console.log("JWT LOGIN FAILED");
          return done(null, false, { message: "JWT Login failed" }); // 失敗
        } else {
          console.log("JWT LOGIN SUCCESS");
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })();
  }),
);

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production-ecs",
  sameSite: "lax",
  signed: true,
  // maxAge: 1000 * 60 * 60, // 1時間
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間
};

export const fido2CookieConfig: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production-ecs",
  sameSite: "lax",
  signed: true,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日
};

// JWT認証のためステートレス。認証済みユーザーのセッション管理不要
// passport.serializeUser((user, done) => {
//   const u = user as User;
//   done(null, u.id); // 認証情報からセッションに書き込む情報を決める。
// });

// passport.deserializeUser(async (id: any, done) => {
//   console.log("deserializeUser id is : ", id);

//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         id: Number(id),
//       },
//     });
//     console.log("deserializeUser is : ", user);
//     // serializeUserでセッションに書き込まれてた(id)からユーザーを復元する。
//     done(null, user);
//   } catch (error) {
//     done(error);
//   }
// });
