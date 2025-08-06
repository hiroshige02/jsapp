// import { PrismaClient, Prisma } from "../generated/prisma/index";

import { PrismaClient, Prisma } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

const hashedPass = await hash("password");

const userData: Prisma.UserCreateInput[] = [
  {
    firstName: "Alice",
    lastName: null,
    email: "alice@prisma.io",
    password: hashedPass,
    // posts: {
    //   create: [
    //     {
    //       title: "Join the Prisma Discord",
    //       content: "https://pris.ly/discord",
    //       published: true,
    //     },
    //     {
    //       title: "Prisma on YouTube",
    //       content: "https://pris.ly/youtube",
    //     },
    //   ],y
    // },
  },
  {
    firstName: "Bob",
    lastName: "lastName",
    email: "bob@prisma.io",
    password: hashedPass,
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

await main();
