import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  processPayment,
  getUserPayments,
  verifyPayment,
  getPaymentAnalytics,
  refundPayment
} from "../controller/paymentController.js";

const router = express.Router();

// Process payment (create new payment)
router.post("/purchase", authMiddleware, processPayment);

// Get user's payment history with pagination
router.get("/history", authMiddleware, getUserPayments);

// Verify specific payment
router.get("/verify/:paymentId", authMiddleware, verifyPayment);

// Refund payment
router.post("/refund/:paymentId", authMiddleware, refundPayment);

// Get payment analytics (admin only)
router.get("/analytics", authMiddleware, requireRole(['admin']), getPaymentAnalytics);

export default router;