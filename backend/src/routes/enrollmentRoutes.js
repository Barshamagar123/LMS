import express from "express";
import { 
  freeEnroll, 
  getMyEnrollments, 
  updateProgress  // Make sure this is imported
} from "../controller/enrollmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { freeEnrollRules, validate } from "../validations/enrollmentValidation.js";

const router = express.Router();

// Student enrollments
router.post("/free", authMiddleware, roleMiddleware(["STUDENT"]), freeEnrollRules, validate, freeEnroll);
router.get("/me", authMiddleware, roleMiddleware(["STUDENT"]), getMyEnrollments);

// Add this route for progress tracking - FIXED PATH
router.post("/:enrollmentId/progress", authMiddleware, roleMiddleware(["STUDENT"]), updateProgress);

export default router;