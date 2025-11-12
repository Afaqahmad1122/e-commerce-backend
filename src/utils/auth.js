import jwt from "jsonwebtoken";

/**
 * Generate JWT token for user
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
