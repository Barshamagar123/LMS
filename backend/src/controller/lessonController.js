import * as lessonService from "../services/lessonService.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create lesson
export const createLesson = asyncHandler(async (req, res) => {
  const { moduleId, title, contentType, order } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "File is required" });

  const lesson = await lessonService.createLesson({
    moduleId: Number(moduleId),
    title,
    contentType,
    order: Number(order),
    contentUrl: `/uploads/${file.filename}`,
  });

  res.status(201).json({ message: "Lesson created", lesson });
});

// Update lesson
export const updateLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { title, contentType, order } = req.body;
  const file = req.file;

  const updates = {
    title,
    contentType,
    order: order ? Number(order) : undefined,
    contentUrl: `/uploads/${file.filename}`,
  };

  const lesson = await lessonService.updateLesson(Number(lessonId), updates);
  res.json({ message: "Lesson updated", lesson });
});

// Delete lesson
export const deleteLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  await lessonService.deleteLesson(Number(lessonId));
  res.json({ message: "Lesson deleted" });
});

// List lessons of a module
export const listLessons = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const lessons = await lessonService.listLessons(Number(moduleId));
  res.json(lessons);
});
