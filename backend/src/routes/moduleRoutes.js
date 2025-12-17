import express from "express";
import {
  createModule,
  getModules,
  getModule,
  updateModule,
  deleteModule
} from "../controller/moduleController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Only instructors can manage modules
router.post("/", authMiddleware, roleMiddleware(["INSTRUCTOR"]), createModule);
router.get("/course/:courseId", authMiddleware, getModules);
router.get("/:id", authMiddleware, getModule);
router.patch("/:id", authMiddleware, roleMiddleware(["INSTRUCTOR"]), updateModule);
router.delete("/:id", authMiddleware, roleMiddleware(["INSTRUCTOR"]), deleteModule);

export default router;
