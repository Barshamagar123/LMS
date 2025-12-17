import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  listLessons
} from "../controller/lessonController.js";

const router = express.Router();

// Create uploads folder if not exists
import fs from "fs";
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

// Allow video, audio, image, pdf
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "video/",
      "audio/",
      "image/",
      "application/pdf"
    ];
    if (!allowed.some(type => file.mimetype.startsWith(type))) {
      return cb(new Error("Unsupported file type"), false);
    }
    cb(null, true);
  }
});

// Create lesson
router.post(
  "/modules/:moduleId/lessons",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  upload.single("file"),   
  createLesson
);

// Update lesson
router.patch(
  "/lessons/:lessonId",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  upload.single("file"),
  updateLesson
);

// Delete
router.delete(
  "/lessons/:lessonId",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  deleteLesson
);

// List lessons by module
router.get(
  "/modules/:moduleId/lessons",
  authMiddleware,
  listLessons
);

export default router;
