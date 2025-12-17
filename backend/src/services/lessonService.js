import prisma from "../config/prisma.js";

// Create lesson
export const createLesson = async ({ moduleId, title, contentType, order, contentUrl }) => {
  return await prisma.lesson.create({
    data: {
      moduleId,
      title,
      contentType,
      order,
      contentUrl
    }
  });
};

// Update lesson
export const updateLesson = async (lessonId, updates) => {
  return await prisma.lesson.update({
    where: { id: lessonId },
    data: updates
  });
};

// Delete lesson
export const deleteLesson = async (lessonId) => {
  await prisma.lesson.delete({ where: { id: lessonId } });
};

// List lessons
export const listLessons = async (moduleId) => {
  return await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { order: "asc" }
  });
};
