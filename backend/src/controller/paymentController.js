import * as paymentService from "../services/paymentService.js";

// Process payment
export const processPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId, amount, paymentMethod, paymentDetails } = req.body;

    // Validation
    if (!courseId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: courseId, amount, paymentMethod" 
      });
    }

    // Convert to numbers
    const numericCourseId = Number(courseId);
    const numericAmount = Number(amount);
    
    if (isNaN(numericCourseId) || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId or amount"
      });
    }

    // Process payment and enrollment in a single transaction
    const result = await paymentService.processPaymentTransaction({
      userId: Number(userId),
      courseId: numericCourseId,
      amount: numericAmount,
      paymentMethod,
      paymentDetails
    });

    res.status(200).json({
      success: true,
      message: "Payment successful and enrollment created",
      payment: result.payment,
      enrollment: result.enrollment
    });

  } catch (err) {
    console.error('Payment processing error:', err);
    
    // Handle specific errors
    if (err.message.includes('already enrolled') || err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course"
      });
    }
    
    if (err.message.includes('Course not found')) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.message.includes('Amount is less')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.message.includes('Unsupported payment method')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.message.includes('insufficient funds') || err.message.includes('payment declined')) {
      return res.status(402).json({
        success: false,
        message: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get user's payment history with pagination
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await paymentService.getUserPaymentHistoryPaginated(
      userId, 
      page, 
      limit
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history"
    });
  }
};

// Verify payment status
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.verifyPaymentStatus(paymentId);
    
    res.json({
      success: true,
      payment
    });
  } catch (err) {
    if (err.message.includes('Payment not found')) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to verify payment"
    });
  }
};

// Get payment analytics (admin only)
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await paymentService.getPaymentAnalytics(startDate, endDate);
    
    res.json({
      success: true,
      analytics
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment analytics"
    });
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentId } = req.params;
    
    const refund = await paymentService.processRefund(paymentId, userId);
    
    res.json({
      success: true,
      message: "Refund initiated successfully",
      refund
    });
  } catch (err) {
    if (err.message.includes('Payment not found')) {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.message.includes('Already refunded')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (err.message.includes('Cannot refund')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Refund processing failed"
    });
  }
};