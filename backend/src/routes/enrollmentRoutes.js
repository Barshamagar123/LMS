import express from "express";
import { freeEnroll, getMyEnrollments } from "../controller/enrollmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { freeEnrollRules, validate } from "../validations/enrollmentValidation.js";

const router = express.Router();

// Student enrollments
router.post("/free", authMiddleware, roleMiddleware(["STUDENT"]), freeEnrollRules, validate, freeEnroll);
router.get("/me", authMiddleware, roleMiddleware(["STUDENT"]), getMyEnrollments);

export default router;
