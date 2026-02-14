import * as prismaUser from "@/lib/prismaUser";
import request from "supertest";
import testApp from "@/testApp";
import { hash } from "argon2";
import type { Express } from "express";
import { User } from "@prisma/client";

jest.setTimeout(10000);
jest.mock("@/lib/prismaUser");

let app: Express | null;

beforeAll(() => {
  jest.clearAllMocks();
  app = testApp();
});

afterAll(() => {
  jest.clearAllMocks();
  app = null;
});

describe("/api/login #POST", () => {
  const email = "momo@example.com";
  const userPassword = "password";

  it("ログイン成功", async () => {
    const hashedPassword = await hash(userPassword);

    const authUser: User = {
      id: 1,
      firstName: "momo",
      lastName: null,
      email,
      password: hashedPassword,
      isMfaActive: false,
      isFido2Active: false,
      twoFactorSecret: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const resUserInfo = {
      id: 1,
      firstName: "momo",
      lastName: null,
      email,
      isMfaActive: false,
      isFido2Active: false,
      twoFactorSecret: null,
    };

    (prismaUser.findUserByEmail as jest.Mock).mockResolvedValue(authUser);
    const res = await request(app as Express)
      .post("/api/login")
      .send({ email, password: userPassword });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: "",
      totpRequire: false,
      user: resUserInfo,
    });
  });
});
