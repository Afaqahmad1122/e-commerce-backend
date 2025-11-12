import prisma from "../config/database.js";
import { verifyToken } from "../utils/auth.js";
import { sendError } from "../utils/response.js";

/**
 * Authentication middleware - Verifies JWT token and attaches user to request
 * Usage: Add to routes that require authentication
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header (format: "Bearer TOKEN")
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return sendError(
        res,
        401,
        "Authentication required. Please provide a token."
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return sendError(res, 401, "User not found. Invalid token.");
    }

    // Attach user to request object for use in controllers
    req.user = user;
    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid token.");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token expired. Please login again.");
    }

    console.error("Authentication error:", error);
    return sendError(res, 500, "Authentication error.");
  }
};

/**
 * Authorization middleware - Checks if user has ADMIN role
 * Must be used after authenticate middleware
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return sendError(res, 403, "Access denied. Admin role required.");
  }
  next();
};
