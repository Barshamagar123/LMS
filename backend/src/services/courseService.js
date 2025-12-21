import prisma from "../config/prisma.js";

/**
 * Create course (instructor only) - UPDATED with thumbnail
 */
export const createCourse = async ({ title, description, price = 0, categoryId, instructorId, thumbnail = null, modules = [] }) => {
  // If modules are provided, create them with lessons
  if (modules && modules.length > 0) {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: Number(price),
        thumbnail,
        categoryId,
        instructorId,
        status: "DRAFT",
        modules: {
          create: modules.map((module, moduleIndex) => ({
            title: module.title || `Module ${moduleIndex + 1}`,
            order: module.order || moduleIndex + 1,
            lessons: module.lessons ? {
              create: module.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title || `Lesson ${lessonIndex + 1}`,
                contentType: lesson.contentType || 'VIDEO',
                contentUrl: lesson.contentUrl || '',
                order: lesson.order || lessonIndex + 1
              }))
            } : undefined
          }))
        }
      },
      include: {
        modules: {
          include: {
            lessons: true
          }
        },
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    return course;
  } else {
    // Create course without modules
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: Number(price),
        thumbnail,
        categoryId,
        instructorId,
        status: "DRAFT",
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    return course;
  }
};

export const updateCourse = async (courseId, updates) => {
  const course = await prisma.course.update({
    where: { id: Number(courseId) },
    data: updates,
    include: {
      modules: {
        include: {
          lessons: true
        }
      }
    }
  });
  return course;
};

export const deleteCourse = async (courseId) => {
  await prisma.course.delete({ where: { id: Number(courseId) } });
  return { success: true };
};

/**
 * Public listing with filters - FIXED to include ALL lessons
 */
export const getCourses = async (filters) => {
  const { category, price = "all", rating_min, q, page = 1, per_page = 12 } = filters;

  const where = { status: "PUBLISHED" };

  if (category) where.categoryId = Number(category);
  if (price === "free") where.price = 0;
  if (price === "paid") where.price = { gt: 0 };
  if (rating_min) where.rating = { gte: Number(rating_min) };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const total = await prisma.course.count({ where });
  const courses = await prisma.course.findMany({
    where,
    skip: (page - 1) * per_page,
    take: Number(per_page),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnail: true,
      rating: true,
      status: true,
      level: true,
      createdAt: true,
      instructor: { select: { id: true, name: true, email: true } },
      enrollments: { select: { id: true } },
      category: true,
      // FIXED: Include ALL lessons for ALL modules
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              contentType: true,
              order: true,
              contentUrl: true,
              duration: true  // Add if you have duration field
            }
          },
          _count: {
            select: { lessons: true }
          }
        },
        orderBy: { order: "asc" }
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      }
    },
  });

  const mapped = courses.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    price: c.price,
    thumbnail: c.thumbnail,
    rating: c.rating,
    level: c.level,
    instructor: c.instructor,
    enrollmentsCount: c._count.enrollments,
    reviewsCount: c._count.reviews,
    category: c.category,
    status: c.status,
    createdAt: c.createdAt,
    // Process modules to include lesson count
    modules: c.modules.map(module => ({
      id: module.id,
      title: module.title,
      order: module.order,
      courseId: module.courseId,
      lessons: module.lessons,  // All lessons included
      lessonsCount: module._count.lessons,
      // Calculate total duration for this module
      totalDuration: module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)
    })),
    // Calculate total course stats
    totalLessons: c.modules.reduce((sum, module) => sum + module._count.lessons, 0),
    totalDuration: c.modules.reduce((sum, module) => 
      sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || 0), 0), 0
    )
  }));

  return { 
    data: mapped, 
    meta: { 
      total, 
      page: Number(page), 
      per_page: Number(per_page),
      total_pages: Math.ceil(total / Number(per_page))
    } 
  };
};

/**
 * Single course details + recommendations - Already correct
 */
export const getCourseDetails = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnail: true,
      rating: true,
      status: true,
      level: true,
      instructorId: true,
      instructor: { 
        select: { 
          id: true, 
          name: true,
          email: true,
          bio: true 
        } 
      },
      modules: { 
        include: { 
          lessons: {
            orderBy: { order: 'asc' }
          } 
        },
        orderBy: { order: 'asc' }
      },
      enrollments: { 
        select: { 
          userId: true, 
          progress: true 
        } 
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      category: true,
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      }
    },
  });

  // Add calculated fields
  if (course) {
    course.totalLessons = course.modules.reduce((sum, module) => 
      sum + module.lessons.length, 0
    );
    
    course.totalDuration = course.modules.reduce((sum, module) => 
      sum + module.lessons.reduce((lessonSum, lesson) => 
        lessonSum + (lesson.duration || 0), 0
      ), 0
    );
  }

  return course;
};

/**
 * Recommend courses - Updated to include more details
 */
export const recommendCourses = async (limit = 4, excludeCourseId = null) => {
  const where = { status: "PUBLISHED" };
  if (excludeCourseId) where.id = { not: excludeCourseId };
  
  const recs = await prisma.course.findMany({
    where,
    take: limit,
    orderBy: { rating: "desc" },
    select: { 
      id: true, 
      title: true, 
      price: true, 
      rating: true,
      thumbnail: true,
      instructor: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          enrollments: true
        }
      }
    }
  });
  
  return recs;
};

/**
 * Instructor-specific: get courses for instructor with stats
 */
export const getInstructorCourses = async (instructorId) => {
  const courses = await prisma.course.findMany({
    where: { instructorId: Number(instructorId) },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      price: true,
      rating: true,
      status: true,
      level: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true,
      category: true,
      modules: {
        include: {
          _count: {
            select: { lessons: true }
          }
        }
      },
      enrollments: { select: { id: true } },
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const mapped = await Promise.all(courses.map(async (c) => {
    const revenueAgg = await prisma.payment.aggregate({
      where: { courseId: c.id, status: "SUCCESS" },
      _sum: { amount: true }
    });
    
    const totalLessons = c.modules.reduce((sum, module) => 
      sum + module._count.lessons, 0
    );
    
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      status: c.status,
      level: c.level,
      enrollmentsCount: c._count.enrollments,
      reviewsCount: c._count.reviews,
      revenue: revenueAgg._sum.amount || 0,
      price: c.price,
      rating: c.rating || 0,
      totalLessons,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      categoryId: c.categoryId,
      category: c.category
    };
  }));

  return mapped;
};

export const getInstructorStats = async (instructorId) => {
  const courses = await prisma.course.findMany({ 
    where: { instructorId: Number(instructorId) },
    include: {
      modules: {
        include: {
          _count: {
            select: { lessons: true }
          }
        }
      }
    }
  });
  
  const courseIds = courses.map(c => c.id);

  const totalStudents = await prisma.enrollment.count({ 
    where: { courseId: { in: courseIds } } 
  });
  
  const revenueAgg = await prisma.payment.aggregate({
    where: { courseId: { in: courseIds }, status: "SUCCESS" },
    _sum: { amount: true }
  });
  
  const avgRatingAgg = await prisma.course.aggregate({
    where: { id: { in: courseIds } },
    _avg: { rating: true }
  });

  const totalLessons = courses.reduce((sum, course) => {
    const moduleLessons = course.modules.reduce((mSum, module) => 
      mSum + module._count.lessons, 0
    );
    return sum + moduleLessons;
  }, 0);

  return {
    totalCourses: courses.length,
    totalStudents,
    totalLessons,
    totalRevenue: revenueAgg._sum.amount || 0,
    averageRating: Number((avgRatingAgg._avg.rating || 0).toFixed(2)),
    publishedCourses: courses.filter(c => c.status === 'PUBLISHED').length,
    draftCourses: courses.filter(c => c.status === 'DRAFT').length,
    pendingCourses: courses.filter(c => c.status === 'PENDING_APPROVAL').length
  };
};

export const getCourseStudentProgress = async (courseId, instructorId) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId), instructorId: Number(instructorId) }
  });
  if (!course) throw new Error("Course not found or not owned by instructor");

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: Number(courseId) },
    include: { 
      user: true,
      course: {
        select: {
          modules: {
            include: {
              _count: {
                select: { lessons: true }
              }
            }
          }
        }
      }
    }
  });

  const totalLessons = enrollments[0]?.course?.modules?.reduce((sum, module) => 
    sum + module._count.lessons, 0
  ) || 0;

  return enrollments.map(e => ({
    studentId: e.user.id,
    studentName: e.user.name,
    studentEmail: e.user.email,
    progress: e.progress,
    completedLessons: Math.floor((e.progress / 100) * totalLessons),
    totalLessons: totalLessons,
    lastActive: e.updatedAt
  }));
};

export const getInstructorRecentActivity = async (instructorId, limit = 10) => {
  const courses = await prisma.course.findMany({ 
    where: { instructorId: Number(instructorId) }, 
    select: { 
      id: true, 
      title: true,
      thumbnail: true
    } 
  });
  const courseIds = courses.map(c => c.id);

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: { 
      user: true, 
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true
        }
      } 
    },
    orderBy: { updatedAt: "desc" },
    take: limit
  });

  return enrollments.map(e => ({
    type: 'enrollment',
    student: e.user.name,
    studentId: e.user.id,
    course: e.course.title,
    courseId: e.course.id,
    courseThumbnail: e.course.thumbnail,
    time: e.updatedAt,
    progress: e.progress || 0
  }));
};