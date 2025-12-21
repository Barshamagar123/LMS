import prisma from "../config/prisma.js";

// Create a new module with optional lessons
export const createModule = async ({ title, order, courseId, lessons = [] }) => {
  const moduleData = {
    title,
    order: Number(order),
    courseId: Number(courseId),
  };

  // Add lessons if provided
  if (lessons && lessons.length > 0) {
    moduleData.lessons = {
      create: lessons.map((lesson, idx) => ({
        title: lesson.title,
        contentType: lesson.contentType || 'VIDEO',
        contentUrl: lesson.contentUrl || '',
        order: lesson.order || idx + 1,
        duration: lesson.duration || 0
      }))
    };
  }

  const module = await prisma.module.create({
    data: moduleData,
    include: { 
      lessons: {
        orderBy: { order: 'asc' }
      } 
    },
  });
  return module;
};

// Get all modules for a course with lessons
export const getModulesByCourse = async (courseId) => {
  const modules = await prisma.module.findMany({
    where: { courseId: Number(courseId) },
    include: { 
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          contentType: true,
          contentUrl: true,
          order: true,
          duration: true,
          createdAt: true,
          updatedAt: true
        }
      },
      _count: {
        select: { lessons: true }
      }
    },
    orderBy: { order: "asc" },
  });

  // Add calculated fields
  return modules.map(module => ({
    ...module,
    totalDuration: module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
    lessonsCount: module._count.lessons
  }));
};

// Get single module by ID with lessons
export const getModuleById = async (id) => {
  const module = await prisma.module.findUnique({
    where: { id: Number(id) },
    include: { 
      lessons: {
        orderBy: { order: 'asc' }
      },
      course: {
        select: {
          id: true,
          title: true,
          instructorId: true
        }
      }
    },
  });
  
  if (module) {
    module.totalDuration = module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
    module.lessonsCount = module.lessons.length;
  }
  
  return module;
};

// Update module
export const updateModule = async (id, updates) => {
  const module = await prisma.module.update({
    where: { id: Number(id) },
    data: updates,
    include: { lessons: true },
  });
  return module;
};

// Delete module (lessons will be cascade deleted)
export const deleteModule = async (id) => {
  await prisma.module.delete({ where: { id: Number(id) } });
  return { success: true };
};

// Get module with course info (for permission checks)
export const getModuleWithCourse = async (moduleId) => {
  return await prisma.module.findUnique({
    where: { id: Number(moduleId) },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructorId: true
        }
      }
    }
  });
};