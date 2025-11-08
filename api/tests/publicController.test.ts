import * as prismaUser from "@/lib/prismaUser";
import { hash } from "argon2";
import request from "supertest";
import testApp from "@/testApp";
import type { Express } from "express";

jest.setTimeout(10000);
jest.mock("@/lib/prismaUser");

let app: Express | null;

beforeAll(async () => {
  jest.clearAllMocks;
  app = testApp();
});

afterAll(async () => {
  jest.clearAllMocks;
  app = null;
});

describe("/api/login #POST", () => {
  const email = "momo@example.com";
  const userPassword = "password";

  it("ログイン成功", async () => {
    const hashedPassword = await hash(userPassword);

    const userInfo = {
      id: 1,
      firstName: "momo",
      lastName: null,
      email,
      isMfaActive: false,
      isFido2Active: false,
      twoFactorSecret: false,
      password: hashedPassword,
    };
    const { password, ...resUserObj } = userInfo;

    (prismaUser.findUserByEmail as jest.Mock).mockResolvedValue(userInfo);
    const res = await request(app as Express)
      .post("/api/login")
      .send({ email, password: userPassword });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: "",
      totpRequire: false,
      user: resUserObj,
    });
  });
});
