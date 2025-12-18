import * as lessonProgressService from "../services/lessonProgressService.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Mark lesson as completed/incompleted
export const updateLessonProgress = asyncHandler(async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  const { completed = true, lastTime, lastPage } = req.body;
  
  const progress = await lessonProgressService.updateProgress(
    Number(enrollmentId),
    req.user.userId,
    Number(lessonId),
    completed,
    lastTime,
    lastPage
  );
  
  res.json({
    success: true,
    message: "Lesson progress updated",
    progress
  });
});

// Get all lesson progress for an enrollment
export const getEnrollmentProgress = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  
  const progress = await lessonProgressService.getEnrollmentProgress(
    Number(enrollmentId),
    req.user.userId
  );
  
  res.json(progress);
});

// Mark lesson as completed
export const completeLesson = asyncHandler(async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  
  const progress = await lessonProgressService.markLessonComplete(
    Number(enrollmentId),
    req.user.userId,
    Number(lessonId)
  );
  
  res.json({
    success: true,
    message: "Lesson marked as completed",
    progress
  });
});

// Update video/audio progress (time tracking)
export const updateTimeProgress = asyncHandler(async (req, res) => {
  const { enrollmentId, lessonId } = req.params;
  const { lastTime } = req.body;
  
  const progress = await lessonProgressService.updateTimeProgress(
    Number(enrollmentId),
    req.user.userId,
    Number(lessonId),
    parseFloat(lastTime)
  );
  
  res.json({
    success: true,
    message: "Time progress updated",
    progress
  });
});