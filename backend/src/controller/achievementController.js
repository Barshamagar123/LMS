import asyncHandler from "../middleware/asyncHandler.js";
import prisma from "../config/prisma.js";

/**
 * @desc    Get user achievements
 * @route   GET /api/users/me/achievements
 * @access  Private (Student)
 */
export const getUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  // Get user's statistics
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: true,
      lessonProgress: true
    }
  });
  
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED');
  const totalLearningTime = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
  
  // Calculate achievements based on user's progress
  const achievements = [
    {
      id: 1,
      title: "First Course Enrolled",
      icon: "🎓",
      unlocked: enrollments.length >= 1,
      description: "Enroll in your first course",
      date: enrollments.length >= 1 ? enrollments[0].createdAt : null
    },
    {
      id: 2,
      title: "Course Completionist",
      icon: "✅",
      unlocked: completedCourses.length >= 1,
      description: "Complete your first course",
      date: completedCourses.length >= 1 ? completedCourses[0].updatedAt : null
    },
    {
      id: 3,
      title: "Learning Explorer",
      icon: "🧭",
      unlocked: enrollments.length >= 3,
      description: "Enroll in 3 different courses",
      date: enrollments.length >= 3 ? enrollments[2].createdAt : null
    },
    {
      id: 4,
      title: "Perfect Progress",
      icon: "⭐",
      unlocked: completedCourses.length >= 1 && 
               completedCourses.some(c => c.progress === 100),
      description: "Achieve 100% progress in a course",
      date: completedCourses.find(c => c.progress === 100)?.updatedAt || null
    },
    {
      id: 5,
      title: "Learning Streak",
      icon: "🔥",
      unlocked: totalLearningTime > 100, // Example condition
      description: "Learn for more than 100 hours total",
      date: totalLearningTime > 100 ? new Date() : null
    },
    {
      id: 6,
      title: "Course Master",
      icon: "👑",
      unlocked: completedCourses.length >= 5,
      description: "Complete 5 courses",
      date: completedCourses.length >= 5 ? completedCourses[4].updatedAt : null
    }
  ];
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  res.json({
    success: true,
    data: achievements,
    stats: {
      total: achievements.length,
      unlocked: unlockedCount,
      progress: Math.round((unlockedCount / achievements.length) * 100)
    }
  });
});