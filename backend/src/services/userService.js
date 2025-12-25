import prisma from "../config/prisma.js";

// Get user by ID
export const getUserById = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const numericId = Number(userId);
  
  if (isNaN(numericId)) {
    throw new Error('Invalid user ID format');
  }

  const user = await prisma.user.findUnique({
    where: { id: numericId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
      bio: true,
      phone: true,
      profilePicture: true,
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    isActive: user.isActive,
    isApproved: user.isApproved,
    joinDate: user.createdAt,
    lastLogin: user.updatedAt,
    bio: user.bio,
    phone: user.phone,
    profilePicture: user.profilePicture
  };
};

// Fetch all users and map to frontend-friendly format
export const fetchAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase(),
    status: u.isActive ? "active" : "inactive",
    joinDate: u.createdAt,
    lastLogin: u.updatedAt
  }));
};

// Change user status (activate/deactivate)
export const changeUserStatus = async (userId, isActive) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const numericId = Number(userId);
  
  if (isNaN(numericId)) {
    throw new Error('Invalid user ID format');
  }

  const updated = await prisma.user.update({
    where: { id: numericId },
    data: { isActive }
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role.toLowerCase(),
    status: updated.isActive ? "active" : "inactive",
    joinDate: updated.createdAt,
    lastLogin: updated.updatedAt
  };
};
// Get user dashboard statistics
export const getUserDashboardStats = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: {
      enrollments: {
        include: {
          course: true,
          lessonProgress: true
        }
      }
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const enrollments = user.enrollments;
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED');
  const inProgressCourses = enrollments.filter(e => e.status === 'IN_PROGRESS');
  
  const totalDuration = enrollments.reduce((sum, enrollment) => {
    return sum + (enrollment.course.totalDuration || 0);
  }, 0);
  
  const averageRating = enrollments.length > 0 
    ? enrollments.reduce((sum, enrollment) => sum + (enrollment.course.rating || 0), 0) / enrollments.length
    : 0;
  
  // Calculate streak (simplified - you'll need proper streak logic)
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const recentActivity = enrollments.filter(e => 
    e.updatedAt >= lastWeek
  ).length;
  
  const streakDays = Math.min(recentActivity * 2, 30); // Simplified calculation
  
  return {
    enrolledCourses: enrollments.length,
    completedCourses: completedCourses.length,
    inProgressCourses: inProgressCourses.length,
    totalLearningHours: Math.round(totalDuration / 60),
    averageRating: averageRating.toFixed(1),
    streakDays,
    achievementCount: completedCourses.length,
    recentActivity: enrollments.slice(0, 5).map(e => ({
      courseId: e.courseId,
      courseTitle: e.course.title,
      progress: e.progress,
      lastAccessed: e.updatedAt
    }))
  };
};