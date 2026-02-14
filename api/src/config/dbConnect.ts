import { PrismaClient } from "@prisma/client";

const dbConnect = () => {
  try {
    new PrismaClient();
    console.log("Database connected:");
  } catch (error) {
    console.log("******** Database connection failed ********");
    console.error(error);
    process.exit(1);
  }
};

export default dbConnect;
