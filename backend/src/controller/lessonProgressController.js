import * as lessonProgressService from "../services/lessonProgressService.js";
import asyncHandler from "../middleware/asyncHandler.js";

// PUT: Update lesson progress
export const updateLessonProgress = asyncHandler(async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  const { completed = true, lastTime, lastPage } = req.body;
  
  console.log(`📝 Updating progress - Enrollment: ${enrollmentId}, Lesson: ${lessonId}`);
  console.log("📦 Request body:", req.body);
  
  // Validate input
  if (!enrollmentId || !lessonId) {
    return res.status(400).json({
      success: false,
      message: "enrollmentId and lessonId are required"
    });
  }
  
  const progress = await lessonProgressService.updateProgress(
    Number(enrollmentId),
    req.user.userId, // Get user ID from auth middleware
    Number(lessonId),
    completed,
    lastTime,
    lastPage
  );
  
  res.json({
    success: true,
    message: "Lesson progress updated successfully",
    progress: {
      enrollmentId: Number(enrollmentId),
      lessonId: Number(lessonId),
      completed: progress.lessonProgress.completed,
      lastTime: progress.lessonProgress.lastTime,
      overallProgress: progress.overallProgress,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons
    }
  });
});

// POST: Mark lesson as completed
export const completeLesson = asyncHandler(async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  
  console.log(`✅ Marking as complete - Enrollment: ${enrollmentId}, Lesson: ${lessonId}`);
  
  // Validate input
  if (!enrollmentId || !lessonId) {
    return res.status(400).json({
      success: false,
      message: "enrollmentId and lessonId are required"
    });
  }
  
  const progress = await lessonProgressService.markLessonComplete(
    Number(enrollmentId),
    req.user.userId,
    Number(lessonId)
  );
  
  res.json({
    success: true,
    message: "Lesson marked as completed",
    progress: {
      enrollmentId: Number(enrollmentId),
      lessonId: Number(lessonId),
      completed: true,
      overallProgress: progress.overallProgress,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons
    }
  });
});

// GET: Get enrollment progress
export const getEnrollmentProgress = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  
  console.log(`📋 Getting progress for enrollment: ${enrollmentId}`);
  
  if (!enrollmentId) {
    return res.status(400).json({
      success: false,
      message: "enrollmentId is required"
    });
  }
  
  const progress = await lessonProgressService.getEnrollmentProgress(
    Number(enrollmentId),
    req.user.userId
  );
  
  res.json({
    success: true,
    enrollment: {
      id: progress.enrollment.id,
      progress: progress.enrollment.progress,
      status: progress.enrollment.status
    },
    course: {
      id: progress.course.id,
      title: progress.course.title,
      thumbnail: progress.course.thumbnail,
      instructor: progress.course.instructor
    },
    lessonProgress: progress.lessonProgress.map(lp => ({
      lessonId: lp.lesson.id,
      lessonTitle: lp.lesson.title,
      completed: lp.completed,
      lastTime: lp.lastTime
    })),
    statistics: {
      totalLessons: progress.statistics.totalLessons,
      completedLessons: progress.statistics.completedLessons,
      progressPercentage: progress.statistics.progressPercentage
    }
  });
});

// PUT: Update time progress
export const updateTimeProgress = asyncHandler(async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  const { lastTime } = req.body;
  
  console.log(`⏱️ Updating time progress - Enrollment: ${enrollmentId}, Lesson: ${lessonId}`);
  console.log("⏰ Last time:", lastTime);
  
  if (!enrollmentId || !lessonId || lastTime === undefined) {
    return res.status(400).json({
      success: false,
      message: "enrollmentId, lessonId, and lastTime are required"
    });
  }
  
  const progress = await lessonProgressService.updateTimeProgress(
    Number(enrollmentId),
    req.user.userId,
    Number(lessonId),
    parseFloat(lastTime)
  );
  
  res.json({
    success: true,
    message: "Time progress updated",
    progress: {
      enrollmentId: Number(enrollmentId),
      lessonId: Number(lessonId),
      lastTime: progress.lastTime,
      updatedAt: progress.updatedAt
    }
  });
});