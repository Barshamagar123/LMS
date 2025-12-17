import prisma from "../config/prisma.js";

/**
 * Enroll student in free course (immediate)
 */
export const enrollFreeCourse = async (userId, courseId) => {
  // 1. Check if course exists
  const course = await prisma.course.findUnique({ 
    where: { id: Number(courseId) } 
  });
  
  if (!course) {
    throw new Error("Course not found");
  }
  
  // 2. Check if course is free
  if (course.price > 0) {
    throw new Error("Course is not free");
  }
  
  // 3. Check if user is already enrolled - THIS IS THE FIX!
  const existing = await prisma.enrollment.findFirst({ 
    where: { 
      userId: Number(userId), 
      courseId: Number(courseId) 
    } 
  });
  
  // 4. IF ALREADY ENROLLED, THROW ERROR - DON'T RETURN!
  if (existing) {
    const error = new Error("Already enrolled in this course");
    error.status = 409; // Add status code for frontend
    throw error;
  }

  // 5. Create new enrollment
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

export const updateLessonProgress = async (enrollmentId, userId, lessonId, completed) => {
  // Verify enrollment belongs to user
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: Number(enrollmentId),
      userId: Number(userId)
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true
            }
          }
        }
      }
    }
  });
  
  if (!enrollment) {
    throw new Error('Enrollment not found');
  }
  
  // Verify lesson belongs to course
  const lessonExists = enrollment.course.modules.some(module => 
    module.lessons.some(lesson => lesson.id === lessonId)
  );
  
  if (!lessonExists) {
    throw new Error('Lesson not found in this course');
  }
  
  // Update completed lessons
  let completedLessons = enrollment.completedLessons || [];
  
  if (completed) {
    // Add lesson if not already completed
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }
  } else {
    // Remove lesson if marked incomplete
    completedLessons = completedLessons.filter(id => id !== lessonId);
  }
  
  // Calculate new progress percentage
  const totalLessons = enrollment.course.modules.reduce((sum, module) => 
    sum + (module.lessons?.length || 0), 0
  );
  
  const progress = totalLessons > 0 
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0;
  
  // Update enrollment
  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: Number(enrollmentId) },
    data: {
      completedLessons,
      progress,
      lastAccessed: new Date()
    }
  });
  
  return updatedEnrollment;
};