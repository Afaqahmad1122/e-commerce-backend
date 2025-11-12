import bcrypt from "bcrypt";
import prisma from "../config/database.js";
import { generateToken } from "../utils/auth.js";
import { validate, authSchemas } from "../utils/validation.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

// Reusable user select fields
const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};

// Bcrypt salt rounds (optimized constant)
const SALT_ROUNDS = 10;

/**
 * Handle validation errors (DRY principle)
 */
const handleValidationError = (error, res) => {
  if (error instanceof z.ZodError) {
    return sendError(res, 400, "Validation error", error.errors);
  }
  return null;
};

/**
 * User Signup Controller
 * POST /api/auth/signup
 * Creates a new user account
 */
export const signup = async (req, res) => {
  try {
    // Validate input data
    const validatedData = validate(authSchemas.signup, req.body);

    // Check if user already exists (optimized: single query)
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true }, // Only select id for existence check
    });

    if (existingUser) {
      return sendError(res, 409, "User with this email already exists.");
    }

    // Hash password (bcrypt with optimized salt rounds)
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      SALT_ROUNDS
    );

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || null,
        role: "USER",
      },
      select: USER_SELECT,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    return sendSuccess(res, 201, "User registered successfully", {
      user,
      token,
    });
  } catch (error) {
    const validationError = handleValidationError(error, res);
    if (validationError) return validationError;

    console.error("Signup error:", error);
    return sendError(res, 500, "Error registering user");
  }
};

/**
 * User Login Controller
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
export const login = async (req, res) => {
  try {
    // Validate input data
    const validatedData = validate(authSchemas.login, req.body);

    // Find user by email (optimized: only select needed fields)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true, // Needed for comparison
      },
    });

    // Validate password (optimized: single error message for security)
    if (
      !user ||
      !(await bcrypt.compare(validatedData.password, user.password))
    ) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return success response (exclude password from response)
    const { password, ...userData } = user;
    return sendSuccess(res, 200, "Login successful", {
      user: userData,
      token,
    });
  } catch (error) {
    const validationError = handleValidationError(error, res);
    if (validationError) return validationError;

    console.error("Login error:", error);
    return sendError(res, 500, "Error logging in");
  }
};

/**
 * Get Current User Controller
 * GET /api/auth/me
 * Returns authenticated user's information
 * Requires: authenticate middleware
 * Optimized: No try-catch needed as req.user is already validated by middleware
 */
export const getCurrentUser = (req, res) => {
  return sendSuccess(res, 200, "User retrieved successfully", {
    user: req.user,
  });
};
