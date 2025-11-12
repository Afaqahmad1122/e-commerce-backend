import bcrypt from "bcrypt";
import prisma from "../config/database.js";
import { generateToken } from "../utils/auth.js";
import { validate, authSchemas } from "../utils/validation.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { z } from "zod";

/**
 * User Signup Controller
 * POST /api/auth/signup
 * Creates a new user account
 */
export const signup = async (req, res) => {
  try {
    // Validate input data
    const validatedData = validate(authSchemas.signup, req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return sendError(res, 409, "User with this email already exists.");
    }

    // Hash password (bcrypt with 10 salt rounds)
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || null,
        role: "USER", // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return success response with user data and token
    return sendSuccess(res, 201, "User registered successfully", {
      user,
      token,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "Validation error", error.errors);
    }

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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return success response (exclude password from response)
    return sendSuccess(res, 200, "Login successful", {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return sendError(res, 400, "Validation error", error.errors);
    }

    console.error("Login error:", error);
    return sendError(res, 500, "Error logging in");
  }
};

/**
 * Get Current User Controller
 * GET /api/auth/me
 * Returns authenticated user's information
 * Requires: authenticate middleware
 */
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by authenticate middleware
    return sendSuccess(res, 200, "User retrieved successfully", {
      user: req.user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return sendError(res, 500, "Error retrieving user");
  }
};
