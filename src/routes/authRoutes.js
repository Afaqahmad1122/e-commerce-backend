import express from "express";
import {
  signup,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/signup", signup);
router.post("/login", login);

// Protected route (authentication required)
router.get("/me", authenticate, getCurrentUser);

export default router;
