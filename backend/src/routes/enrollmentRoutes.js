import express from "express";
import { 
  freeEnroll, 
  getMyEnrollments, 
  checkCourseEnrollment,
  getEnrollmentById,
  updateEnrollmentStatus,
  getCourseEnrollmentStats,
  unenrollFromCourse,
  getCourseEnrollments,
  getEnrollmentAnalytics,
  getPopularCourses,
  updateLastAccessed
} from "../controller/enrollmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { freeEnrollRules, validate } from "../validations/enrollmentValidation.js";

const router = express.Router();

// Public routes
router.get("/popular-courses", getPopularCourses);

// Student routes
router.post("/free", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  freeEnrollRules, 
  validate, 
  freeEnroll
);

router.get("/me", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  getMyEnrollments
);

router.get("/check/:courseId", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  checkCourseEnrollment
);

router.get("/:enrollmentId", 
  authMiddleware, 
  roleMiddleware(["STUDENT", "INSTRUCTOR", "ADMIN"]), 
  getEnrollmentById
);

router.put("/:enrollmentId/last-accessed", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  updateLastAccessed
);

router.delete("/:enrollmentId", 
  authMiddleware, 
  roleMiddleware(["STUDENT", "ADMIN"]), 
  unenrollFromCourse
);

// Instructor routes
router.get("/course/:courseId/stats", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR", "ADMIN"]), 
  getCourseEnrollmentStats
);

router.get("/course/:courseId", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR", "ADMIN"]), 
  getCourseEnrollments
);

// Admin routes
router.put("/:enrollmentId/status", 
  authMiddleware, 
  roleMiddleware(["ADMIN"]), 
  updateEnrollmentStatus
);

router.get("/analytics/overview", 
  authMiddleware, 
  roleMiddleware(["ADMIN"]), 
  getEnrollmentAnalytics
);

export default router;