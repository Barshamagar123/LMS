import * as paymentService from "../services/paymentService.js";
import asyncHandler from "../middleware/asyncHandler.js";

/**
 * @desc    Process payment for a course
 * @route   POST /api/payments/process
 * @access  Private (Student)
 */
export const processPayment = asyncHandler(async (req, res) => {
  const { courseId, paymentMethod, paymentDetails } = req.body;
  const userId = req.user.userId;

  console.log('Payment request received:', { courseId, paymentMethod, userId });

  // Validate required fields
  if (!courseId || !paymentMethod) {
    console.log('Validation failed: missing courseId or paymentMethod');
    return res.status(400).json({
      success: false,
      message: "Course ID and payment method are required"
    });
  }

  try {
    // Process payment and create enrollment
    console.log('Calling paymentService.processPaymentAndEnroll');
    const result = await paymentService.processPaymentAndEnroll({
      userId,
      courseId: Number(courseId),
      paymentMethod,
      paymentDetails: paymentDetails || {}
    });

    console.log('Payment successful:', result);
    res.status(200).json({
      success: true,
      message: "Payment successful and enrollment created",
      data: result
    });

  } catch (error) {
    console.error('Payment processing error:', error);

    // Handle specific errors
    if (error.message.includes('already enrolled') || error.status === 409) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
        code: "ALREADY_ENROLLED"
      });
    }

    if (error.message.includes('Course not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Course is not published')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Payment already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message,
        code: "DUPLICATE_PAYMENT"
      });
    }

    // Pass other errors to asyncHandler
    throw error;
  }
});

/**
 * @desc    Get user's payment history
 * @route   GET /api/payments/history
 * @access  Private (Student)
 */
export const getUserPayments = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10, status } = req.query;

  const result = await paymentService.getUserPayments(
    userId,
    parseInt(page),
    parseInt(limit),
    status
  );

  res.json({
    success: true,
    ...result
  });
});

/**
 * @desc    Verify payment status
 * @route   GET /api/payments/verify/:paymentId
 * @access  Private (Student/Admin)
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.userId;

  const payment = await paymentService.verifyPaymentStatus(
    Number(paymentId),
    userId
  );

  res.json({
    success: true,
    data: payment
  });
});

/**
 * @desc    Check if user has paid for a course
 * @route   GET /api/payments/check/:courseId
 * @access  Private (Student)
 */
export const checkCoursePayment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.userId;

  const paymentExists = await paymentService.checkPaymentExists(
    userId,
    Number(courseId)
  );

  res.json({
    success: true,
    hasPaid: paymentExists,
    data: paymentExists || null
  });
});

/**
 * @desc    Create payment intent (for card payments)
 * @route   POST /api/payments/create-intent
 * @access  Private (Student)
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { courseId, amount } = req.body;
  const userId = req.user.userId;

  if (!courseId || !amount) {
    return res.status(400).json({
      success: false,
      message: "Course ID and amount are required"
    });
  }

  const intent = await paymentService.createPaymentIntent({
    userId,
    courseId: Number(courseId),
    amount: parseFloat(amount)
  });

  res.json({
    success: true,
    data: intent
  });
});

/**
 * @desc    Handle payment callback (for eSewa/Khalti)
 * @route   POST /api/payments/callback/:gateway
 * @access  Public
 */
export const handlePaymentCallback = asyncHandler(async (req, res) => {
  const { gateway } = req.params;
  const callbackData = req.body;

  const result = await paymentService.handleGatewayCallback(
    gateway.toUpperCase(),
    callbackData
  );

  res.json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get payment analytics (admin only)
 * @route   GET /api/payments/analytics
 * @access  Private (Admin)
 */
export const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const analytics = await paymentService.getPaymentAnalytics(
    startDate,
    endDate
  );

  res.json({
    success: true,
    data: analytics
  });
});

/**
 * @desc    Refund payment
 * @route   POST /api/payments/:paymentId/refund
 * @access  Private (Admin)
 */
export const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  const refund = await paymentService.processRefund(
    Number(paymentId),
    reason || "Requested by user"
  );

  res.json({
    success: true,
    message: "Refund initiated successfully",
    data: refund
  });
});
