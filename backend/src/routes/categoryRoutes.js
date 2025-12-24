import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import * as categoryController from "../controller/categoryController.js";

const router = express.Router();

// Admin only
router.post("/", authMiddleware, isAdmin, categoryController.create);
router.patch("/:id", authMiddleware, isAdmin, categoryController.update);
router.delete("/:id", authMiddleware, isAdmin, categoryController.remove);

// Public
router.get("/", categoryController.list);
router.get("/stats", categoryController.getCategoryStats);

export default router;
