import prisma from "../config/prisma.js";

/**
 * Process payment and create enrollment in a single transaction
 * Prevents duplicate payments and enrollments
 */
export const processPaymentAndEnroll = async ({ userId, courseId, paymentMethod, paymentDetails }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if course exists and is published
    const course = await tx.course.findUnique({
      where: {
        id: courseId,
        status: "PUBLISHED"
      },
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (!course) {
      const error = new Error("Course not found or not published");
      error.status = 404;
      throw error;
    }

    // 2. Check if user is already enrolled
    const existingEnrollment = await tx.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      const error = new Error("User is already enrolled in this course");
      error.status = 409;
      throw error;
    }

    // 3. Check for existing successful payment for this course by same user
    const existingPayment = await tx.payment.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
        status: "SUCCESS"
      }
    });

    if (existingPayment) {
      const error = new Error("Payment already exists for this course");
      error.status = 409;
      error.code = "DUPLICATE_PAYMENT";
      throw error;
    }

    // 4. Create payment record
    const payment = await tx.payment.create({
      data: {
        userId: userId,
        courseId: courseId,
        amount: course.price,
        status: "SUCCESS",
        paymentMethod: paymentMethod.toUpperCase(),
        paymentDetails: JSON.stringify(paymentDetails)
      }
    });

    // 5. Create enrollment
    const enrollment = await tx.enrollment.create({
      data: {
        userId: userId,
        courseId: courseId,
        progress: 0,
        status: "IN_PROGRESS"
      }
    });

    // 6. Create LessonProgress records for all lessons
    const lessons = course.modules.flatMap(module => module.lessons);
    
    if (lessons.length > 0) {
      await Promise.all(
        lessons.map(lesson =>
          tx.lessonProgress.create({
            data: {
              enrollmentId: enrollment.id,
              lessonId: lesson.id,
              completed: false
            }
          })
        )
      );
    }

    // 7. Get full details for response
    const fullEnrollment = await tx.enrollment.findUnique({
      where: { id: enrollment.id },
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

    return {
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt
      },
      enrollment: fullEnrollment
    };
  }, {
    maxWait: 5000,
    timeout: 10000
  });
};

/**
 * Get user payments with pagination
 */
export const getUserPayments = async (userId, page = 1, limit = 10, status = null) => {
  const skip = (page - 1) * limit;
  
  const whereClause = {
    userId: Number(userId)
  };
  
  if (status) {
    whereClause.status = status;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
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
            status: true
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
      where: whereClause
    })
  ]);

  return {
    payments: payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
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

/**
 * Verify payment status
 */
export const verifyPaymentStatus = async (paymentId, userId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: Number(paymentId),
      userId: Number(userId)
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          price: true
        }
      },
      enrollment: {
        select: {
          id: true,
          progress: true,
          status: true
        }
      }
    }
  });

  if (!payment) {
    const error = new Error("Payment not found");
    error.status = 404;
    throw error;
  }

  return {
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    createdAt: payment.createdAt,
    course: payment.course,
    enrollment: payment.enrollment,
    paymentDetails: JSON.parse(payment.paymentDetails || '{}')
  };
};

/**
 * Check if payment exists for a course
 */
export const checkPaymentExists = async (userId, courseId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      userId: Number(userId),
      courseId: Number(courseId),
      status: "SUCCESS"
    },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true
    }
  });

  return payment;
};

/**
 * Handle payment gateway callbacks
 */
export const handleGatewayCallback = async (gateway, callbackData) => {
  return await prisma.$transaction(async (tx) => {
    // Extract necessary data from callback
    const { transactionId, amount, courseId, userId, status } = callbackData;
    
    if (status !== "COMPLETED") {
      throw new Error(`Payment ${status.toLowerCase()}`);
    }

    // Check for existing payment with same transaction ID
    const existingPayment = await tx.payment.findFirst({
      where: {
        paymentDetails: {
          contains: transactionId
        }
      }
    });

    if (existingPayment) {
      throw new Error("Duplicate transaction");
    }

    // Process payment
    const result = await processPaymentAndEnroll({
      userId: parseInt(userId),
      courseId: parseInt(courseId),
      paymentMethod: gateway,
      paymentDetails: callbackData
    });

    return result;
  });
};

/**
 * Get payment analytics
 */
export const getPaymentAnalytics = async (startDate, endDate) => {
  const whereClause = {
    status: "SUCCESS"
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
    topCourses
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: whereClause,
      _sum: { amount: true }
    }),
    prisma.payment.count({
      where: whereClause
    }),
    prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: whereClause,
      _sum: { amount: true },
      _count: { id: true }
    }),
    prisma.payment.findMany({
      where: whereClause,
      include: {
        course: {
          select: { title: true }
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.course.findMany({
      where: {
        price: { gt: 0 },
        enrollments: { some: {} }
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            payments: {
              where: { status: "SUCCESS" }
            }
          }
        },
        instructor: {
          select: { name: true }
        }
      },
      orderBy: {
        payments: {
          _count: 'desc'
        }
      },
      take: 10
    })
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
      amount: payment.amount,
      method: payment.paymentMethod,
      date: payment.createdAt,
      course: payment.course.title,
      user: payment.user.name
    })),
    topCourses: topCourses.map(course => ({
      id: course.id,
      title: course.title,
      instructor: course.instructor.name,
      price: course.price,
      enrollments: course._count.enrollments,
      successfulPayments: course._count.payments
    }))
  };
};

/**
 * Process refund
 */
export const processRefund = async (paymentId, reason) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: Number(paymentId) },
      include: {
        enrollment: true
      }
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status === "REFUNDED") {
      throw new Error("Payment already refunded");
    }

    // Update payment status to REFUNDED
    const updatedPayment = await tx.payment.update({
      where: { id: Number(paymentId) },
      data: {
        status: "REFUNDED"
      }
    });

    // Remove enrollment if exists
    if (payment.enrollment) {
      // First delete lesson progress records
      await tx.lessonProgress.deleteMany({
        where: { enrollmentId: payment.enrollment.id }
      });

      // Then delete enrollment
      await tx.enrollment.delete({
        where: { id: payment.enrollment.id }
      });
    }

    return {
      id: updatedPayment.id,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
      refundedAt: new Date(),
      reason: reason
    };
  });
};