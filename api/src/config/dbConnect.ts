import { PrismaClient } from "@prisma/client";

const dbConnect = async () => {
  try {
    const prisma = new PrismaClient();
    console.log("Database connected:");
  } catch (error) {
    console.log(`Database connection failed: ${error}`);
    process.exit(1);
  }
};

export default dbConnect;
