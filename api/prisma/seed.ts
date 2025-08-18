import { PrismaClient, Prisma } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();
const hashedPass = await hash("password");

const userData: Prisma.UserCreateInput = {
  firstName: "momo",
  email: "momo@example.com",
  password: hashedPass,
};

export async function main() {
  await prisma.user.create({ data: userData });
}

await main();
