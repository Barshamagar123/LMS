import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  listLessons
} from "../controller/lessonController.js";

// Import your existing multer config
import { uploads } from "../config/multer.js";

const router = express.Router();

// Create lesson for a module
// URL: POST /api/modules/:moduleId/lessons
router.post(
  "/modules/:moduleId/lessons",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  uploads.courseVideo.single("file"),  // Uses course-videos folder
  createLesson
);

// Update a lesson
// URL: PATCH /api/lessons/:lessonId
router.patch(
  "/lessons/:lessonId",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  uploads.courseVideo.single("file"),
  updateLesson
);

// Delete a lesson
// URL: DELETE /api/lessons/:lessonId
router.delete(
  "/lessons/:lessonId",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  deleteLesson
);

// List all lessons for a module
// URL: GET /api/modules/:moduleId/lessons
router.get(
  "/modules/:moduleId/lessons",
  authMiddleware,
  listLessons
);

export default router;