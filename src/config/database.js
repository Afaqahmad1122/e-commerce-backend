import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error", "warn"],
  errorFormat: "pretty",
});

// databse connection
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("Connected to database");
    return true;
  } catch (error) {
    console.log("Error connecting to database", error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected");
  } catch (error) {
    console.error("Error disconnecting database:", error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

// Export Prisma instance
export default prisma;
