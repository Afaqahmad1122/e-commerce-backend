import prisma from "../config/database.js";
import { verifyToken } from "../utils/auth.js";
import { sendError } from "../utils/response.js";

// User fields to select (reusable constant)
const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
};

/**
 * Authentication middleware - Verifies JWT token and attaches user to request
 * Usage: Add to routes that require authentication
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header (optimized single-line extraction)
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return sendError(
        res,
        401,
        "Authentication required. Please provide a token."
      );
    }

    // Verify token and decode
    const decoded = verifyToken(token);

    // Fetch user from database (optimized query with select)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: USER_SELECT,
    });

    if (!user) {
      return sendError(res, 401, "User not found. Invalid token.");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT-specific errors efficiently
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
