import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  processPayment,
  getUserPayments,
  verifyPayment,
  checkCoursePayment,
  createPaymentIntent,
  handlePaymentCallback,
  getPaymentAnalytics,
  refundPayment
} from "../controller/paymentController.js";

// Import validation rules and validate function
import {
  processPaymentValidation,
  createPaymentIntentValidation,
  refundPaymentValidation
} from "../validations/paymenteValidation.js";
import { validate } from "../middleware/validationMiddleware.js"; // Import validate from middleware

const router = express.Router();

// Payment processing
router.post(
  "/process",
  authMiddleware,
  roleMiddleware(["STUDENT"]),
  processPaymentValidation, // This provides the validation rules
  validate, // This validates the request against those rules
  processPayment
);

// Create payment intent (for card payments)
router.post(
  "/create-intent",
  authMiddleware,
  roleMiddleware(["STUDENT"]),
  createPaymentIntentValidation,
  validate,
  createPaymentIntent
);

// Other routes remain the same...
router.get(
  "/history",
  authMiddleware,
  roleMiddleware(["STUDENT", "ADMIN"]),
  getUserPayments
);

router.get(
  "/verify/:paymentId",
  authMiddleware,
  roleMiddleware(["STUDENT", "ADMIN"]),
  verifyPayment
);

router.get(
  "/check/:courseId",
  authMiddleware,
  roleMiddleware(["STUDENT"]),
  checkCoursePayment
);

// Payment gateway callbacks (public)
router.post("/callback/:gateway", handlePaymentCallback);

// Admin routes
router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getPaymentAnalytics
);

router.post(
  "/:paymentId/refund",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  refundPaymentValidation,
  validate,
  refundPayment
);

export default router;