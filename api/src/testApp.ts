import express, { json, urlencoded } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import authRoutes from "@/routes/authRoutes";
import publicRoutes from "@/routes/publicRoutes";
import "@/config/passportConfig";
import { cookieConfig } from "@/config/passportConfig";
import cookieParser from "cookie-parser";

/**
 * テスト用express
 */
export default () => {
  const app = express();

  // ******** Middlewares ********
  app.use(express.json());
  app.use(json({ limit: "100mb" }));
  app.use(urlencoded({ limit: "100mb", extended: true }));
  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      cookie: cookieConfig,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // App Routes
  app.use("/api/auth", authRoutes);
  app.use("/api", publicRoutes);
  // 404 Handler
  app.use((req, res, _) => {
    res.status(404).json({ path: req.path, message: "404 NOT FOUND" });
  });

  return app;
};
