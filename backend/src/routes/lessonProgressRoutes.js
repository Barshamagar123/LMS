import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  updateLessonProgress,
  getEnrollmentProgress,
  completeLesson,
  updateTimeProgress
} from "../controllers/lessonProgressController.js";

const router = express.Router();

// Get all progress for an enrollment
router.get("/:enrollmentId", authMiddleware, roleMiddleware(["STUDENT"]), getEnrollmentProgress);

// Update lesson progress (completion status)
router.put("/:enrollmentId/lessons/:lessonId", authMiddleware, roleMiddleware(["STUDENT"]), updateLessonProgress);

// Mark lesson as completed (shortcut)
router.post("/:enrollmentId/lessons/:lessonId/complete", authMiddleware, roleMiddleware(["STUDENT"]), completeLesson);

// Update time progress for video/audio
router.put("/:enrollmentId/lessons/:lessonId/time", authMiddleware, roleMiddleware(["STUDENT"]), updateTimeProgress);

export default router;