import prisma from "../config/prisma.js";

/**
 * Enroll student in free course (immediate)
 */
export const enrollFreeCourse = async (userId, courseId) => {
  const course = await prisma.course.findUnique({ where: { id: Number(courseId) } });
  if (!course) throw new Error("Course not found");
  if (course.price > 0) throw new Error("Course is not free");

  // check existing enrollment
  const existing = await prisma.enrollment.findFirst({ where: { userId: Number(userId), courseId: Number(courseId) } });
  if (existing) return existing;

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: Number(userId),
      courseId: Number(courseId),
      progress: 0
    }
  });
  return enrollment;
};

export const getUserEnrollments = async (userId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: Number(userId) },
    include: { course: true }
  });
  return enrollments;
};
