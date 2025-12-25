import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getAllUsers, updateUserStatus, getCurrentUser, getUserDashboardStats } from "../controller/userController.js";

const router = express.Router();

// Get current user profile
router.get("/me", authMiddleware, getCurrentUser);

// Get all users (admin only - you might want to add role middleware)
router.get("/", authMiddleware, getAllUsers);

// Update user status (activate/deactivate)
router.patch("/:id/status", authMiddleware, updateUserStatus);
// Add this route
router.get("/me/stats", 
  authMiddleware, 
  getUserDashboardStats
);

export default router;
