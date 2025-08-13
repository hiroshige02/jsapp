import express, { json, urlencoded } from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "@/routes/authRoutes";
import publicRoutes from "@/routes/publicRoutes";
import "@/config/passportConfig";
import { cookieConfig } from "@/config/passportConfig";
import cookieParser from "cookie-parser";
import { User as PrismaUser } from "@prisma/client";

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONT_BASE_URL, //アクセス許可するオリジン
  credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
  // optionsSuccessStatus: 200, //レスポンスstatusを200
  // に設定
  // maxAge: 86402, // キャッシュ時間（秒）
  // methods: ['GET', 'POST', 'PUT', 'DELETE'],    // 許可するHTTPメソッド
};

// ******** Middlewares ********
app.use(express.json());
app.use(cors(corsOptions));
app.use(json({ limit: "100mb" }));
app.use(urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

declare module "express-session" {
  interface SessionData {
    secret: string;
    registOptions: PublicKeyCredentialCreationOptionsJSON;
    authOptions: PublicKeyCredentialRequestOptionsJSON;
  }
}
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

// Listen App
const port = process.env.PORT;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
