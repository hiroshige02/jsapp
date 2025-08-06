import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.log("Database connection failed:", error);
  process.exit(1);
}

export default prisma;
