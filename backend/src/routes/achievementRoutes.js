import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { getUserAchievements } from "../controller/achievementController.js";

const router = express.Router();

router.get("/me/achievements", 
  authMiddleware, 
  roleMiddleware(["STUDENT"]), 
  getUserAchievements
);

export default router;