import * as enrollmentService from "../services/enrollmentService.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const freeEnroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  
  try {
    const enrollment = await enrollmentService.enrollFreeCourse(
      req.user.userId, 
      Number(courseId)
    );
    
    res.status(201).json({
      success: true,
      message: "Successfully enrolled in the course",
      enrollment
    });
    
  } catch (error) {
    // Check if it's a duplicate enrollment error
    if (error.message === "Already enrolled in this course" || error.status === 409) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
        code: "ALREADY_ENROLLED"
      });
    }
    
    // Pass other errors to asyncHandler
    throw error;
  }
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getUserEnrollments(req.user.userId);
  res.json(enrollments);
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { lessonId, completed } = req.body;
  const { enrollmentId } = req.params;
  
  const enrollment = await enrollmentService.updateLessonProgress(
    Number(enrollmentId),
    req.user.userId,
    Number(lessonId),
    completed
  );
  
  res.json(enrollment);
});