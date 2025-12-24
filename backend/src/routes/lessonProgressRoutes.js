import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  updateLessonProgress,
  getEnrollmentProgress,
  completeLesson,
  updateTimeProgress
} from "../controller/lessonProgressController.js";

const router = express.Router();

// Base path: /api/progress

// Get all progress for an enrollment
router.get("/:enrollmentId", 
  authMiddleware, 
  roleMiddleware(["STUDENT", "INSTRUCTOR", "ADMIN"]), 
  getEnrollmentProgress
);

// Update lesson progress (completion status) - This is your PUT endpoint
router.put("/:enrollmentId/lessons/:lessonId", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  updateLessonProgress
);

// Mark lesson as completed (shortcut) - This is your POST endpoint
router.post("/:enrollmentId/lessons/:lessonId/complete", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  completeLesson
);

// Update time progress for video/audio
router.put("/:enrollmentId/lessons/:lessonId/time", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  updateTimeProgress
);

export default router;