import prisma from "../config/prisma.js";

/**
 * Enroll student in free course (immediate)
 */
export const enrollFreeCourse = async (userId, courseId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if course exists and is published
    const course = await tx.course.findUnique({ 
      where: { 
        id: Number(courseId),
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
    
    // 2. Check if course is free
    if (course.price > 0) {
      const error = new Error("Course is not free");
      error.status = 400;
      throw error;
    }
    
    // 3. Check if user is already enrolled
    const existing = await tx.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: Number(userId),
          courseId: Number(courseId)
        }
      }
    });
    
    if (existing) {
      const error = new Error("Already enrolled in this course");
      error.status = 409;
      throw error;
    }

    // 4. Create new enrollment
    const enrollment = await tx.enrollment.create({
      data: {
        userId: Number(userId),
        courseId: Number(courseId),
        progress: 0,
        status: "IN_PROGRESS"
      }
    });

    // 5. Create LessonProgress records for all lessons
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

    // 6. Get full enrollment details
    const fullEnrollment = await tx.enrollment.findUnique({
      where: { id: enrollment.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            },
            modules: {
              include: {
                lessons: true
              }
            }
          }
        },
        lessonProgress: {
          select: {
            lessonId: true,
            completed: true
          }
        }
      }
    });

    return fullEnrollment;
  });
};

/**
 * Get user enrollments with progress
 */
export const getUserEnrollments = async (userId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { 
      userId: Number(userId) 
    },
    include: {
      course: {
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          },
          category: true,
          modules: {
            include: {
              lessons: true
            }
          },
          _count: {
            select: {
              reviews: true,
              enrollments: true
            }
          }
        }
      },
      lessonProgress: {
        include: {
          lesson: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  // Calculate progress for each enrollment
  return enrollments.map(enrollment => {
    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + (module.lessons?.length || 0), 
      0
    );
    
    const completedLessons = enrollment.lessonProgress.filter(
      lp => lp.completed
    ).length;
    
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      ...enrollment,
      progress,
      completedLessons,
      totalLessons,
      stats: {
        totalModules: enrollment.course.modules.length,
        totalLessons,
        completedLessons,
        progressPercentage: progress
      }
    };
  });
};

/**
 * Check if user is enrolled in a course
 */
export const checkEnrollment = async (userId, courseId) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: Number(userId),
        courseId: Number(courseId)
      }
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          instructor: {
            select: {
              name: true
            }
          }
        }
      },
      lessonProgress: {
        include: {
          lesson: true
        }
      }
    }
  });

  if (!enrollment) return null;

  // Calculate progress
  const totalLessons = await prisma.lesson.count({
    where: {
      module: {
        courseId: Number(courseId)
      }
    }
  });

  const completedLessons = enrollment.lessonProgress.filter(
    lp => lp.completed
  ).length;

  const progress = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return {
    ...enrollment,
    progress,
    completedLessons,
    totalLessons,
    isCompleted: enrollment.status === 'COMPLETED'
  };
};

/**
 * Get enrollment by ID with authorization
 */
export const getEnrollmentById = async (enrollmentId, userId) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: Number(enrollmentId),
      userId: Number(userId) // Ensure user owns this enrollment
    },
    include: {
      course: {
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          },
          modules: {
            include: {
              lessons: {
                include: {
                  lessonProgress: {
                    where: {
                      enrollmentId: Number(enrollmentId)
                    }
                  }
                }
              }
            }
          }
        }
      },
      lessonProgress: {
        include: {
          lesson: true
        }
      }
    }
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.status = 404;
    throw error;
  }

  // Calculate progress
  const totalLessons = enrollment.course.modules.reduce(
    (sum, module) => sum + (module.lessons?.length || 0), 
    0
  );
  
  const completedLessons = enrollment.lessonProgress.filter(
    lp => lp.completed
  ).length;
  
  const progress = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return {
    ...enrollment,
    progress,
    completedLessons,
    totalLessons
  };
};

/**
 * Update enrollment status (admin only)
 */
export const updateEnrollmentStatus = async (enrollmentId, status) => {
  // Validate status
  const validStatuses = ['IN_PROGRESS', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    const error = new Error("Invalid enrollment status");
    error.status = 400;
    throw error;
  }

  const enrollment = await prisma.enrollment.update({
    where: { id: Number(enrollmentId) },
    data: {
      status: status,
      updatedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      course: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  return enrollment;
};

/**
 * Get course enrollment statistics (for instructor)
 */
export const getCourseEnrollmentStats = async (courseId, userId) => {
  // Verify user is instructor of this course
  const course = await prisma.course.findFirst({
    where: {
      id: Number(courseId),
      instructorId: Number(userId)
    }
  });

  if (!course) {
    const error = new Error("Course not found or unauthorized");
    error.status = 404;
    throw error;
  }

  const [
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    avgProgress,
    recentEnrollments
  ] = await Promise.all([
    // Total enrollments
    prisma.enrollment.count({
      where: { courseId: Number(courseId) }
    }),
    
    // Active enrollments
    prisma.enrollment.count({
      where: { 
        courseId: Number(courseId),
        status: 'IN_PROGRESS'
      }
    }),
    
    // Completed enrollments
    prisma.enrollment.count({
      where: { 
        courseId: Number(courseId),
        status: 'COMPLETED'
      }
    }),
    
    // Average progress
    prisma.enrollment.aggregate({
      where: { courseId: Number(courseId) },
      _avg: { progress: true }
    }),
    
    // Recent enrollments
    prisma.enrollment.findMany({
      where: { courseId: Number(courseId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  return {
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    completionRate: totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0,
    averageProgress: avgProgress._avg.progress || 0,
    recentEnrollments: recentEnrollments.map(enrollment => ({
      id: enrollment.id,
      userName: enrollment.user.name,
      userAvatar: enrollment.user.profilePicture,
      progress: enrollment.progress,
      status: enrollment.status,
      enrolledAt: enrollment.createdAt
    }))
  };
};

/**
 * Unenroll from a course
 */
export const unenrollCourse = async (enrollmentId, userId, userRole) => {
  return await prisma.$transaction(async (tx) => {
    // Find enrollment
    const enrollment = await tx.enrollment.findUnique({
      where: { id: Number(enrollmentId) }
    });

    if (!enrollment) {
      const error = new Error("Enrollment not found");
      error.status = 404;
      throw error;
    }

    // Check authorization
    if (userRole !== 'ADMIN' && enrollment.userId !== Number(userId)) {
      const error = new Error("Unauthorized to unenroll");
      error.status = 403;
      throw error;
    }

    // Delete lesson progress records first
    await tx.lessonProgress.deleteMany({
      where: { enrollmentId: Number(enrollmentId) }
    });

    // Delete enrollment
    await tx.enrollment.delete({
      where: { id: Number(enrollmentId) }
    });

    return true;
  });
};

/**
 * Get enrollments for a course (instructor/admin)
 */
export const getCourseEnrollments = async (courseId, userId, userRole, options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;

  // For instructors, verify they own the course
  if (userRole === 'INSTRUCTOR') {
    const course = await prisma.course.findFirst({
      where: {
        id: Number(courseId),
        instructorId: Number(userId)
      }
    });

    if (!course) {
      const error = new Error("Course not found or unauthorized");
      error.status = 404;
      throw error;
    }
  }

  // Build where clause
  const whereClause = {
    courseId: Number(courseId)
  };

  if (status) {
    whereClause.status = status;
  }

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        },
        lessonProgress: {
          select: {
            completed: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit
    }),
    prisma.enrollment.count({
      where: whereClause
    })
  ]);

  // Calculate progress for each enrollment
  const enrichedEnrollments = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalLessons = await prisma.lesson.count({
        where: {
          module: {
            courseId: Number(courseId)
          }
        }
      });

      const completedLessons = enrollment.lessonProgress.filter(
        lp => lp.completed
      ).length;

      const progress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      return {
        ...enrollment,
        progress,
        completedLessons,
        totalLessons,
        lessonProgress: undefined // Remove lessonProgress array
      };
    })
  );

  return {
    enrollments: enrichedEnrollments,
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
 * Get enrollment analytics
 */
export const getEnrollmentAnalytics = async (startDate, endDate) => {
  const whereClause = {};

  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  }

  const [
    totalEnrollments,
    enrollmentsByStatus,
    enrollmentsByCourse,
    dailyEnrollments,
    topCourses
  ] = await Promise.all([
    // Total enrollments
    prisma.enrollment.count({
      where: whereClause
    }),
    
    // Enrollments by status
    prisma.enrollment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true
      }
    }),
    
    // Enrollments by course
    prisma.enrollment.groupBy({
      by: ['courseId'],
      where: whereClause,
      _count: {
        id: true
      },
      _avg: {
        progress: true
      }
    }),
    
    // Daily enrollments for last 30 days
    prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM Enrollment
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `,
    
    // Top courses by enrollment
    prisma.course.findMany({
      where: {
        enrollments: {
          some: {}
        }
      },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        },
        instructor: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 10
    })
  ]);

  return {
    summary: {
      totalEnrollments,
      activeEnrollments: enrollmentsByStatus.find(e => e.status === 'IN_PROGRESS')?._count?.id || 0,
      completedEnrollments: enrollmentsByStatus.find(e => e.status === 'COMPLETED')?._count?.id || 0
    },
    byStatus: enrollmentsByStatus.map(item => ({
      status: item.status,
      count: item._count.id
    })),
    byCourse: await Promise.all(
      enrollmentsByCourse.map(async (item) => {
        const course = await prisma.course.findUnique({
          where: { id: item.courseId },
          select: {
            title: true,
            category: true
          }
        });

        return {
          courseId: item.courseId,
          courseTitle: course?.title || 'Unknown',
          category: course?.category?.name || 'Uncategorized',
          enrollments: item._count.id,
          averageProgress: item._avg.progress || 0
        };
      })
    ),
    dailyEnrollments,
    topCourses: topCourses.map(course => ({
      id: course.id,
      title: course.title,
      instructor: course.instructor.name,
      enrollmentCount: course._count.enrollments,
      rating: course.rating || 0
    }))
  };
};

/**
 * Get popular courses based on enrollments
 */
export const getPopularCourses = async (limit = 10) => {
  const courses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      price: 0 // Only free courses for popular
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          profilePicture: true
        }
      },
      category: true,
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      }
    },
    orderBy: {
      enrollments: {
        _count: 'desc'
      }
    },
    take: limit
  });

  return courses.map(course => ({
    ...course,
    enrollmentCount: course._count.enrollments,
    reviewCount: course._count.reviews
  }));
};

/**
 * Update last accessed time for enrollment
 */
export const updateLastAccessed = async (enrollmentId, userId) => {
  // Verify enrollment belongs to user
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: Number(enrollmentId),
      userId: Number(userId)
    }
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.status = 404;
    throw error;
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: Number(enrollmentId) },
    data: {
      updatedAt: new Date()
    },
    include: {
      course: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  return updatedEnrollment;
};