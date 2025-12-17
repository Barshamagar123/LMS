import express from "express";
import {
  sendOTP,
  verifyOTP,
  getPendingInstructors,
  approveInstructor,
  rejectInstructor,
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getPendingCourses,
  approveCourse,
  rejectCourse
} from "../controller/adminController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post("/login/send-otp", sendOTP);
router.post("/login/verify-otp", verifyOTP);

router.use(authMiddleware, roleMiddleware(["ADMIN"])); // All routes below require admin

// Instructors Approval
router.get("/instructors/pending", getPendingInstructors);
router.patch("/instructor/:userId/approve", approveInstructor);
router.patch("/instructor/:userId/reject", rejectInstructor);

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);

router.get("/courses/pending", getPendingCourses);
router.patch("/courses/:id/approve", approveCourse);
router.patch("/courses/:id/reject", rejectCourse);


export default router;
