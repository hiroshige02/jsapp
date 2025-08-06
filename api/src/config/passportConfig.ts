import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { verify } from "argon2";
import prisma from "@/lib/prisma";
import { Strategy as JWTStrategy, StrategyOptions } from "passport-jwt";
import { CookieOptions, Request as ExpressRequest } from "express";

// パスワードログイン用
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user || !(await verify(user.password, password))) {
          console.log("LOGIN FAILED");
          return done(null, false, { message: " Login failed" }); // 失敗
        } else {
          console.log("PASSPORT LOGIN SUCCESS");

          return done(null, user);
        } // 成功
      } catch (error) {
        console.log("LOGIN CATCE ERROR");

        return done(error);
      }
    }
  )
);

// 認証用のJWT tokenはCookieから取得
const cookieExtractor = (req: any) => {
  return req?.cookies?.token ? req.cookies.token : null;
};
const opts: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET!,
};
// JWT tokenログイン用
passport.use(
  new JWTStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.sub },
      });

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
  })
);

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  // maxAge: 1000 * 60 * 60, // 1時間
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
