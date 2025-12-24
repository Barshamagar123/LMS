import prisma from "../config/prisma.js";

// Update lesson progress and recalculate overall enrollment progress
export const updateProgress = async (enrollmentId, userId, lessonId, completed = true, lastTime = null, lastPage = null) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify enrollment belongs to user
    const enrollment = await tx.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: userId
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
      throw new Error('Enrollment not found or unauthorized');
    }
    
    // 2. Verify lesson belongs to course
    const lessonExists = enrollment.course.modules.some(module => 
      module.lessons.some(lesson => lesson.id === lessonId)
    );
    
    if (!lessonExists) {
      throw new Error('Lesson not found in this course');
    }
    
    // 3. Create or update lesson progress
    const lessonProgress = await tx.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollmentId,
          lessonId: lessonId
        }
      },
      update: {
        completed: completed,
        lastTime: lastTime,
        lastPage: lastPage,
        updatedAt: new Date()
      },
      create: {
        enrollmentId: enrollmentId,
        lessonId: lessonId,
        completed: completed,
        lastTime: lastTime,
        lastPage: lastPage
      }
    });
    
    // 4. Calculate new overall progress
    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + (module.lessons?.length || 0), 
      0
    );
    
    const completedLessons = await tx.lessonProgress.count({
      where: {
        enrollmentId: enrollmentId,
        completed: true
      }
    });
    
    const newProgress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
    
    // 5. Update enrollment status
    let status = enrollment.status;
    if (newProgress === 100) {
      status = 'COMPLETED';
    } else if (newProgress > 0 && enrollment.status === 'IN_PROGRESS') {
      status = 'IN_PROGRESS';
    }
    
    // 6. Update enrollment progress
    await tx.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: newProgress,
        status: status,
        updatedAt: new Date()
      }
    });
    
    return {
      lessonProgress,
      overallProgress: newProgress,
      completedLessons,
      totalLessons
    };
  });
};

// Simplified version for marking complete
export const markLessonComplete = async (enrollmentId, userId, lessonId) => {
  return await updateProgress(enrollmentId, userId, lessonId, true);
};

// For tracking video/audio time
export const updateTimeProgress = async (enrollmentId, userId, lessonId, lastTime) => {
  return await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: userId
      }
    });
    
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    
    const lessonProgress = await tx.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollmentId,
          lessonId: lessonId
        }
      },
      update: {
        lastTime: lastTime,
        updatedAt: new Date()
      },
      create: {
        enrollmentId: enrollmentId,
        lessonId: lessonId,
        lastTime: lastTime,
        completed: false
      }
    });
    
    return lessonProgress;
  });
};

// Get all lesson progress for an enrollment
export const getEnrollmentProgress = async (enrollmentId, userId) => {
  // Verify enrollment belongs to user
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: enrollmentId,
      userId: userId
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  lessonProgress: {
                    where: {
                      enrollmentId: enrollmentId
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
    throw new Error('Enrollment not found');
  }
  
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
    enrollment: {
      id: enrollment.id,
      progress: enrollment.progress,
      status: enrollment.status
    },
    course: enrollment.course,
    lessonProgress: enrollment.lessonProgress,
    statistics: {
      totalLessons,
      completedLessons,
      progressPercentage: progress
    }
  };
};