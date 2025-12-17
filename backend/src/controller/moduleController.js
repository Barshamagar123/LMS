import * as moduleService from "../services/moduleService.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create a new module
export const createModule = asyncHandler(async (req, res) => {
  const { title, order, courseId } = req.body;
  const module = await moduleService.createModule({ title, order, courseId });
  res.status(201).json({ message: "Module created", module });
});

// Get modules for a course
export const getModules = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const modules = await moduleService.getModulesByCourse(courseId);
  res.json(modules);
});

// Get single module
export const getModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const module = await moduleService.getModuleById(id);
  res.json(module);
});

// Update module
export const updateModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const module = await moduleService.updateModule(id, updates);
  res.json({ message: "Module updated", module });
});

// Delete module
export const deleteModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await moduleService.deleteModule(id);
  res.json({ message: "Module deleted" });
});
