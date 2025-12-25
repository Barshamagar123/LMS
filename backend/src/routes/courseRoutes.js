import express from "express";
import {
  listCourses,
  courseDetails,
  createCourse,
  updateCourse,
  deleteCourse,
  instructorCourses,
  instructorStats,
  uploadCourseThumbnail,
  getRecommendedCourses  // Added this import
} from "../controller/courseController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { courseOwnerMiddleware, validateCourseOwnership } from "../middleware/ownershipMiddleware.js";
import { createCourseRules, updateCourseRules, courseQueryRules, validate } from "../validations/courseValidation.js";

// Import multer config
import { uploads, handleMulterError, getFileUrl } from "../config/multer.js";

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.get("/", listCourses);
router.get("/:id", courseDetails);

// ========== INSTRUCTOR ROUTES ==========
router.post("/", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]),
  uploads.courseThumbnail.single('thumbnail'), // Handle thumbnail upload
  handleMulterError,
  express.json(),
  createCourseRules, 
  validate, 
  createCourse
);

router.put("/:id", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]),
  courseOwnerMiddleware(), // Check ownership
  uploads.courseThumbnail.single('thumbnail'), // Handle thumbnail update
  handleMulterError,
  express.json(),
  updateCourseRules,
  validate,
  updateCourse
);

// Alternative using PATCH (choose one - PUT or PATCH, not both)
// router.patch("/:id", 
//   authMiddleware, 
//   roleMiddleware(["INSTRUCTOR"]),
//   courseOwnerMiddleware(),
//   uploads.courseThumbnail.single('thumbnail'),
//   handleMulterError,
//   express.json(),
//   updateCourseRules,
//   validate,
//   updateCourse
// );

router.delete("/:id", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]),
  courseOwnerMiddleware(),
  deleteCourse
);

// ========== INSTRUCTOR-SPECIFIC ENDPOINTS ==========
router.get("/instructor/me", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  instructorCourses
);

router.get("/instructor/me/stats", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  instructorStats
);

// ========== SEPARATE THUMBNAIL UPLOAD ENDPOINTS ==========
// Upload thumbnail for existing course (separate endpoint)
router.post("/:id/thumbnail",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  courseOwnerMiddleware(),
  uploads.courseThumbnail.single('file'),
  handleMulterError,
  uploadCourseThumbnail  // Use the controller function
);

// ========== ADDITIONAL ROUTES ==========
// Get all courses for current instructor (with pagination/filtering)
router.get("/instructor/my-courses",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  instructorCourses  // Reuse existing controller
);

// Check if user owns a course (useful for frontend)
router.get("/:id/check-ownership",
  authMiddleware,
  courseOwnerMiddleware(),
  (req, res) => {
    res.json({
      success: true,
      isOwner: true,
      course: {
        id: req.course.id,
        title: req.course.title,
        thumbnail: req.course.thumbnail
      }
    });
  }
);
// Add in the public routes section
router.get("/recommended", 
  authMiddleware, 
  getRecommendedCourses  // Make sure this function is imported
);

export default router;
