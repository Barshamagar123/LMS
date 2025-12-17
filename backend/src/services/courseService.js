import prisma from "../config/prisma.js";
/**
 * Create course (instructor only) - UPDATED with thumbnail
 */
export const createCourse = async ({ title, description, price = 0, categoryId, instructorId, thumbnail = null }) => {
  const course = await prisma.course.create({
    data: {
      title,
      description,
      price: Number(price),
      thumbnail, // ← ADD THIS
      categoryId,
      instructorId,
      status: "DRAFT",
    },
  });
  return course;
};

export const updateCourse = async (courseId, updates) => {
  const course = await prisma.course.update({
    where: { id: Number(courseId) },
    data: updates,
  });
  return course;
};

export const deleteCourse = async (courseId) => {
  await prisma.course.delete({ where: { id: Number(courseId) } });
  return { success: true };
};

/**
 * Public listing with filters - UPDATED to include thumbnail
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
    select: { // Use SELECT instead of INCLUDE for better control
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnail: true, // ← ADD THIS
      rating: true,
      status: true,
      createdAt: true,
      instructor: { select: { id: true, name: true } },
      enrollments: { select: { id: true } },
      category: true,
      modules: {
        include: {
          lessons: {
            where: { contentType: 'VIDEO' },
            orderBy: { order: 'asc' },
            take: 1
          }
        },
        orderBy: { order: 'asc' }
      },
    },
  });

  const mapped = courses.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    price: c.price,
    thumbnail: c.thumbnail, // ← ADD THIS
    rating: c.rating,
    instructor: c.instructor,
    enrollmentsCount: c.enrollments.length,
    category: c.category,
    status: c.status,
    createdAt: c.createdAt,
    modules: c.modules
  }));

  return { data: mapped, meta: { total, page: Number(page), per_page: Number(per_page) } };
};

/**
 * Single course details + recommendations - UPDATED to include thumbnail
 */
export const getCourseDetails = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
    select: { // Use SELECT for better control
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnail: true, // ← ADD THIS
      rating: true,
      status: true,
      instructorId: true,
      instructor: { select: { id: true, name: true } },
      modules: { include: { lessons: true } },
      enrollments: { select: { userId: true, progress: true } },
      reviews: true,
      category: true
    },
  });
  return course;
};

/**
 * Recommend courses - UPDATED to include thumbnail
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
      thumbnail: true // ← ADD THIS
    }
  });
  return recs;
};

/**
 * Instructor-specific: get courses for instructor with stats - UPDATED
 */
export const getInstructorCourses = async (instructorId) => {
  const courses = await prisma.course.findMany({
    where: { instructorId: Number(instructorId) },
    select: { // Use SELECT
      id: true,
      title: true,
      description: true,
      thumbnail: true, // ← ADD THIS
      price: true,
      rating: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true,
      category: true,
      enrollments: { select: { id: true } }
    }
  });

  const mapped = await Promise.all(courses.map(async (c) => {
    const enrollmentsCount = c.enrollments.length;
    const revenueAgg = await prisma.payment.aggregate({
      where: { courseId: c.id, status: "SUCCESS" },
      _sum: { amount: true }
    });
    
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail, // ← ADD THIS
      status: c.status,
      enrollmentsCount,
      revenue: revenueAgg._sum.amount || 0,
      price: c.price,
      rating: c.rating || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      categoryId: c.categoryId,
      category: c.category
    };
  }));

  return mapped;
};

// The rest of your functions remain the same...
export const getInstructorStats = async (instructorId) => {
  const courses = await prisma.course.findMany({ where: { instructorId: Number(instructorId) } });
  const courseIds = courses.map(c => c.id);

  const totalStudents = await prisma.enrollment.count({ where: { courseId: { in: courseIds } } });
  const revenueAgg = await prisma.payment.aggregate({
    where: { courseId: { in: courseIds }, status: "SUCCESS" },
    _sum: { amount: true }
  });
  const avgRatingAgg = await prisma.course.aggregate({
    where: { id: { in: courseIds } },
    _avg: { rating: true }
  });

  return {
    totalStudents,
    totalRevenue: revenueAgg._sum.amount || 0,
    averageRating: Number((avgRatingAgg._avg.rating || 0).toFixed(2))
  };
};

export const getCourseStudentProgress = async (courseId, instructorId) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId), instructorId: Number(instructorId) }
  });
  if (!course) throw new Error("Course not found or not owned by instructor");

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: Number(courseId) },
    include: { user: true }
  });

  return enrollments.map(e => ({
    studentId: e.user.id,
    studentName: e.user.name,
    progress: e.progress,
    lastActive: e.updatedAt
  }));
};

export const getInstructorRecentActivity = async (instructorId, limit = 10) => {
  const courses = await prisma.course.findMany({ 
    where: { instructorId: Number(instructorId) }, 
    select: { 
      id: true, 
      title: true,
      thumbnail: true // ← ADD THIS
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
          thumbnail: true // ← ADD THIS
        }
      } 
    },
    orderBy: { updatedAt: "desc" },
    take: limit
  });

  return enrollments.map(e => ({
    type: 'enrollment',
    student: e.user.name,
    course: e.course.title,
    courseThumbnail: e.course.thumbnail, // ← ADD THIS
    time: e.updatedAt
  }));
};