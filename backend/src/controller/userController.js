import * as userService from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as enrollmentService from "../services/enrollmentService.js";

// GET /users/me - Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (err) {
    if (err.message.includes('User not found')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// Existing functions...
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.fetchAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const updatedUser = await userService.changeUserStatus(id, isActive);
    res.json(updatedUser);
  } catch (err) {
    if (err.message.includes('Invalid user ID') || err.message.includes('User ID is required')) {
      return res.status(400).json({ message: err.message });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(500).json({ message: err.message });
  }
};
// GET /users/me/stats - Get user dashboard statistics

/**
 * @desc    Get user dashboard statistics
 * @route   GET /api/users/me/stats
 * @access  Private (All users)
 */
export const getUserDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    // Get user enrollments for statistics
    const enrollments = await enrollmentService.getUserEnrollments(userId);
    
    // Calculate statistics
    const completedCourses = enrollments.filter(e => e.status === 'COMPLETED');
    const inProgressCourses = enrollments.filter(e => e.status === 'IN_PROGRESS');
    
    // Calculate total learning time (in minutes)
    const totalDuration = enrollments.reduce((sum, enrollment) => {
      const courseDuration = enrollment.course?.modules?.reduce((moduleSum, module) => {
        return moduleSum + (module.lessons?.reduce((lessonSum, lesson) => 
          lessonSum + (lesson.duration || 0), 0) || 0);
      }, 0) || 0;
      return sum + courseDuration;
    }, 0);
    
    // Calculate average rating of enrolled courses
    const enrolledCourses = enrollments.map(e => e.course).filter(Boolean);
    const averageRating = enrolledCourses.length > 0 
      ? enrolledCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / enrolledCourses.length 
      : 0;
    
    // Simple streak calculation (last 7 days activity)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const recentActivity = enrollments.filter(e => {
      const updatedDate = new Date(e.updatedAt);
      return updatedDate >= lastWeek;
    }).length;
    
    // Simplified streak logic
    const streakDays = Math.min(Math.floor(recentActivity * 1.5), 30);
    
    const stats = {
      enrolledCourses: enrollments.length,
      completedCourses: completedCourses.length,
      inProgressCourses: inProgressCourses.length,
      totalLearningHours: Math.round(totalDuration / 60), // Convert to hours
      averageRating: averageRating.toFixed(1),
      streakDays,
      achievementCount: completedCourses.length,
      
      // For students only
      ...(userRole === 'STUDENT' && {
        completionRate: enrollments.length > 0 
          ? Math.round((completedCourses.length / enrollments.length) * 100)
          : 0,
        averageProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
          : 0
      }),
      
      // For instructors only
      ...(userRole === 'INSTRUCTOR' && {
        totalStudents: await enrollmentService.getInstructorStudentCount(userId),
        totalRevenue: await enrollmentService.getInstructorRevenue(userId)
      })
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (err) {
    console.error('Error getting user dashboard stats:', err);
    
    if (err.message.includes('User not found')) {
      return res.status(404).json({ 
        success: false,
        message: err.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to get dashboard statistics'
    });
  }
});
