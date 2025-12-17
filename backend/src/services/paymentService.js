import prisma from "../config/prisma.js";

// Main payment processing with transaction
export const processPaymentTransaction = async ({ userId, courseId, amount, paymentMethod, paymentDetails }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check enrollment INSIDE transaction (prevents race conditions)
    const existingEnrollment = await tx.enrollment.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    if (existingEnrollment) {
      throw new Error('User is already enrolled in this course');
    }

    // 2. Get course with price
    const course = await tx.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        instructorId: true
      }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // 3. Validate amount
    const coursePrice = parseFloat(course.price);
    const requestedAmount = parseFloat(amount);
    
    if (requestedAmount < coursePrice) {
      throw new Error(`Amount is less than course price. Required: ${coursePrice}`);
    }

    // 4. Generate unique transaction ID
    const transactionId = generateTransactionId(paymentMethod);
    
    // 5. Create payment record
    const payment = await tx.payment.create({
      data: {
        userId: userId,
        courseId: courseId,
        amount: requestedAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'SUCCESS',
        transactionId: transactionId,
        gatewayResponse: JSON.stringify({
          transactionId: transactionId,
          gateway: paymentMethod.toUpperCase(),
          status: 'approved',
          timestamp: new Date().toISOString()
        }),
        paymentDetails: JSON.stringify(paymentDetails || {})
      }
    });

    // 6. Create enrollment immediately (atomic operation)
    const enrollment = await tx.enrollment.create({
      data: {
        userId: userId,
        courseId: courseId,
        paymentId: payment.id,
        progress: 0,
        completed: false
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            instructor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // 7. Update course enrollment count
    await tx.course.update({
      where: { id: courseId },
      data: {
        enrolledCount: {
          increment: 1
        }
      }
    });

    return {
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt,
        gatewayResponse: JSON.parse(payment.gatewayResponse)
      },
      enrollment: {
        id: enrollment.id,
        course: enrollment.course,
        progress: enrollment.progress,
        enrolledAt: enrollment.createdAt
      }
    };
  }, {
    maxWait: 5000, // Maximum time to wait for a transaction
    timeout: 10000 // Maximum time for the transaction to complete
  });
};

// Generate unique transaction ID
const generateTransactionId = (paymentMethod) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const prefix = paymentMethod.toUpperCase() === 'COD' ? 'COD' : 
                paymentMethod.toUpperCase() === 'ESEWA' ? 'ESW' :
                paymentMethod.toUpperCase() === 'KHALTI' ? 'KHL' : 'TXN';
  
  return `${prefix}-${timestamp}-${random}`;
};

// Get user payment history with pagination
export const getUserPaymentHistoryPaginated = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: {
        userId: Number(userId),
        status: 'SUCCESS'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true
          }
        },
        enrollment: {
          select: {
            id: true,
            progress: true,
            completed: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: skip,
      take: limit
    }),
    prisma.payment.count({
      where: {
        userId: Number(userId),
        status: 'SUCCESS'
      }
    })
  ]);

  return {
    payments: payments.map(payment => ({
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      date: payment.createdAt,
      course: payment.course,
      enrollment: payment.enrollment
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

// Verify payment status
export const verifyPaymentStatus = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: Number(paymentId) },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          price: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      enrollment: {
        select: {
          id: true,
          progress: true,
          completed: true
        }
      }
    }
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return {
    id: payment.id,
    transactionId: payment.transactionId,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    createdAt: payment.createdAt,
    course: payment.course,
    user: payment.user,
    enrollment: payment.enrollment,
    gatewayResponse: JSON.parse(payment.gatewayResponse || '{}')
  };
};

// Get payment analytics
export const getPaymentAnalytics = async (startDate, endDate) => {
  const whereClause = {
    status: 'SUCCESS'
  };

  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }

  const [
    totalRevenue,
    totalPayments,
    revenueByMethod,
    recentPayments,
    dailyRevenue
  ] = await Promise.all([
    // Total revenue
    prisma.payment.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      }
    }),
    
    // Total payments count
    prisma.payment.count({
      where: whereClause
    }),
    
    // Revenue by payment method
    prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    }),
    
    // Recent payments
    prisma.payment.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    }),
    
    // Daily revenue for last 7 days
    prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as paymentCount,
        SUM(amount) as totalAmount
      FROM Payment
      WHERE status = 'SUCCESS'
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `
  ]);

  return {
    summary: {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPayments,
      averageOrderValue: totalPayments > 0 ? (totalRevenue._sum.amount || 0) / totalPayments : 0
    },
    byPaymentMethod: revenueByMethod.map(method => ({
      method: method.paymentMethod,
      revenue: method._sum.amount,
      count: method._count.id
    })),
    recentPayments: recentPayments.map(payment => ({
      id: payment.id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.paymentMethod,
      date: payment.createdAt,
      course: payment.course.title,
      user: payment.user.name
    })),
    dailyRevenue
  };
};

// Process refund
export const processRefund = async (paymentId, userId) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: Number(paymentId) },
      include: {
        enrollment: true
      }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Verify user owns this payment
    if (payment.userId !== Number(userId)) {
      throw new Error('Unauthorized to refund this payment');
    }

    // Check if already refunded
    if (payment.status === 'REFUNDED') {
      throw new Error('Payment already refunded');
    }

    // Check if payment can be refunded (within 7 days)
    const paymentDate = new Date(payment.createdAt);
    const now = new Date();
    const daysDiff = (now - paymentDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      throw new Error('Cannot refund payment after 7 days');
    }

    // Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: Number(paymentId) },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        gatewayResponse: JSON.stringify({
          ...JSON.parse(payment.gatewayResponse || '{}'),
          refundStatus: 'processed',
          refundedAt: new Date().toISOString()
        })
      }
    });

    // Remove enrollment if exists
    if (payment.enrollment) {
      await tx.enrollment.delete({
        where: { id: payment.enrollment.id }
      });

      // Decrement course enrollment count
      await tx.course.update({
        where: { id: payment.courseId },
        data: {
          enrolledCount: {
            decrement: 1
          }
        }
      });
    }

    return {
      id: updatedPayment.id,
      transactionId: updatedPayment.transactionId,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
      refundedAt: updatedPayment.refundedAt
    };
  });
};

// Check if user is already enrolled (kept for backward compatibility)
export const checkEnrollment = async (userId, courseId) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: Number(userId),
      courseId: Number(courseId)
    }
  });

  return enrollment;
};

// Create payment (kept for backward compatibility)
export const createPayment = async (paymentData) => {
  // This is now deprecated - use processPaymentTransaction instead
  throw new Error('Use processPaymentTransaction instead for atomic operations');
};

// Create enrollment (kept for backward compatibility)
export const createEnrollment = async (userId, courseId, paymentId) => {
  // This is now deprecated
  throw new Error('Use processPaymentTransaction instead for atomic operations');
};