import { z } from "zod";

// Reusable email schema
const emailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase()
  .trim();

// Reusable password schema
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password too long");

/**
 * Validation schemas for authentication
 */
export const authSchemas = {
  signup: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name too long")
      .optional(),
  }),

  login: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
};

/**
 * Validate request data against schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {object} data - Data to validate
 * @returns {object} Validated data
 * @throws {z.ZodError} If validation fails
 */
export const validate = (schema, data) => {
  return schema.parse(data);
};
