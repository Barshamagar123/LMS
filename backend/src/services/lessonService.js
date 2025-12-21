import prisma from "../config/prisma.js";

// Create lesson - SIMPLE VERSION
export const createLesson = async ({ moduleId, title, contentType, order, contentUrl }) => {
  console.log("💾 Saving lesson to database:", { 
    moduleId, 
    title, 
    contentType, 
    order, 
    contentUrl 
  });
  
  // Validate inputs
  if (!moduleId || isNaN(moduleId)) {
    throw new Error(`Invalid moduleId: ${moduleId}`);
  }
  
  if (!contentUrl) {
    throw new Error("contentUrl is required");
  }
  
  return await prisma.lesson.create({
    data: {
      moduleId: parseInt(moduleId),
      title: title || "Untitled Lesson",
      contentType: contentType || "VIDEO",
      order: parseInt(order) || 1,
      contentUrl: contentUrl
    }
  });
};

// Update lesson
export const updateLesson = async (lessonId, updates) => {
  console.log("🔄 Updating lesson ID:", lessonId);
  
  if (!lessonId || isNaN(lessonId)) {
    throw new Error(`Invalid lessonId: ${lessonId}`);
  }
  
  return await prisma.lesson.update({
    where: { id: parseInt(lessonId) },
    data: updates
  });
};

// Delete lesson
export const deleteLesson = async (lessonId) => {
  console.log("🗑️ Deleting lesson ID:", lessonId);
  
  if (!lessonId || isNaN(lessonId)) {
    throw new Error(`Invalid lessonId: ${lessonId}`);
  }
  
  await prisma.lesson.delete({ 
    where: { id: parseInt(lessonId) }
  });
  
  return { success: true, lessonId: parseInt(lessonId) };
};

// List lessons
export const listLessons = async (moduleId) => {
  console.log("📋 Fetching lessons for module ID:", moduleId);
  
  if (!moduleId || isNaN(moduleId)) {
    throw new Error(`Invalid moduleId: ${moduleId}`);
  }
  
  return await prisma.lesson.findMany({
    where: { 
      moduleId: parseInt(moduleId) 
    },
    orderBy: { 
      order: "asc" 
    },
    select: {
      id: true,
      title: true,
      contentType: true,
      contentUrl: true,
      order: true,
      moduleId: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

// Get single lesson
export const getLessonById = async (lessonId) => {
  if (!lessonId || isNaN(lessonId)) {
    throw new Error(`Invalid lessonId: ${lessonId}`);
  }
  
  return await prisma.lesson.findUnique({
    where: { id: parseInt(lessonId) },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  });
};