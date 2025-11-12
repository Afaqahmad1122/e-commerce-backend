import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
} from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

// dotenv config
dotenv.config();

// create express app
const app = express();

// middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// logging middleware
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// health check
app.get("/api/health", async (req, res) => {
  const dbHealth = await checkDatabaseHealth();

  res.status(dbHealth ? 200 : 501).json({
    status: dbHealth ? "ok" : "unhealthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbHealth ? "connected" : "disconnected",
  });
});

// API routes
app.use("/api/auth", authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// global error handler

app.use((err, req, res, next) => {
  console.error("Error", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

// port
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();

    // listeing the server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    // graceful shutdown
    const gracefulShutdown = async () => {
      console.log("Shutting down server...");
      await disconnectDatabase();
      server.close();
      process.exit(0);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
    process.on("uncaughtException", gracefulShutdown);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
