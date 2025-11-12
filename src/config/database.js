import { PrismaClient } from "@prisma/client";

// Optimized Prisma client configuration for Neon database
const prisma = new PrismaClient({
  // Reduced logging - Neon's connection pooler closes idle connections
  // which Prisma logs as errors, but it's normal behavior
  log: process.env.NODE_ENV === "development" ? [] : [],
  errorFormat: "pretty",
});

// Database connection (Prisma connects lazily, but we verify it works)
export async function connectDatabase() {
  try {
    // Test connection with a simple query instead of explicit $connect()
    // This works better with Neon's connection pooler
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection verified");
    return true;
  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
    throw error;
  }
}

// Graceful disconnect
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected gracefully");
  } catch (error) {
    // Ignore errors during disconnect (connection might already be closed)
    console.log("Database disconnect:", error.message);
  }
}

// Health check function with better error handling
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Database health check failed:", error.message);
    }
    return false;
  }
}

// Note: Prisma handles connection pooling automatically with Neon
// The "Closed" error is normal with connection poolers and can be safely ignored

// Export Prisma instance
export default prisma;
