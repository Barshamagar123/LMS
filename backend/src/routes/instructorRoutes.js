// routes/instructorRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploads, handleMulterError } from "../config/multer.js"; // Import from config
import {
  getInstructorDashboard,
  getCourseProgress,
  createCourse,
  completeProfile,
  getProfile,
  updateProfile,
  checkProfileStatus,
  uploadProfilePicture
} from "../controller/instructorController.js";

const router = express.Router();

// ============ PROFILE ROUTES ============
router.post("/complete-profile", authMiddleware, roleMiddleware(["INSTRUCTOR"]), completeProfile);
router.get("/profile", authMiddleware, roleMiddleware(["INSTRUCTOR"]), getProfile);
router.patch("/profile", authMiddleware, roleMiddleware(["INSTRUCTOR"]), updateProfile);
router.get("/profile/status", authMiddleware, roleMiddleware(["INSTRUCTOR"]), checkProfileStatus);

// Profile picture upload with error handling
router.post("/profile/upload-picture", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]),
  uploads.profilePicture.single('profilePicture'),
  handleMulterError, // Add error handler
  uploadProfilePicture
);

// ============ COURSE ROUTES ============
// Course thumbnail upload
router.post("/courses/:courseId/thumbnail",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  uploads.courseThumbnail.single('thumbnail'),
  handleMulterError,
  (req, res) => {
    // Handle course thumbnail upload
    const thumbnailUrl = getFileUrl(req.file, 'courseThumbnail');
    res.json({ url: thumbnailUrl });
  }
);

// Course video upload
router.post("/courses/:courseId/video",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  uploads.courseVideo.single('video'),
  handleMulterError,
  (req, res) => {
    // Handle course video upload
    const videoUrl = getFileUrl(req.file, 'courseVideo');
    res.json({ url: videoUrl });
  }
);

// ============ DASHBOARD ROUTES ============
router.use(authMiddleware, roleMiddleware(["INSTRUCTOR"]));
router.get("/dashboard", getInstructorDashboard);
router.get("/courses/:courseId/progress", getCourseProgress);
router.post("/courses", createCourse);

export default router;