import prisma from "../config/prisma.js";

// Create a new module
export const createModule = async ({ title, order, courseId }) => {
  const module = await prisma.module.create({
    data: { title, order: Number(order), courseId: Number(courseId) },
  });
  return module;
};

// Get all modules for a course
export const getModulesByCourse = async (courseId) => {
  const modules = await prisma.module.findMany({
    where: { courseId: Number(courseId) },
    include: { lessons: true },
    orderBy: { order: "asc" },
  });
  return modules;
};

// Get single module by ID
export const getModuleById = async (id) => {
  const module = await prisma.module.findUnique({
    where: { id: Number(id) },
    include: { lessons: true },
  });
  return module;
};

// Update module
export const updateModule = async (id, updates) => {
  const module = await prisma.module.update({
    where: { id: Number(id) },
    data: updates,
  });
  return module;
};

// Delete module
export const deleteModule = async (id) => {
  await prisma.module.delete({ where: { id: Number(id) } });
  return { success: true };
};
