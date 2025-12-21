import * as lessonService from "../services/lessonService.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create lesson
export const createLesson = asyncHandler(async (req, res) => {
  console.log("🎬 CREATE LESSON CONTROLLER CALLED");
  console.log("=".repeat(50));
  
  // Get moduleId from URL PARAMS (not body!)
  const moduleId = req.params.moduleId;  // ← FROM URL
  const { title, contentType, order } = req.body;
  const file = req.file;

  console.log("📝 URL Params - moduleId:", moduleId);
  console.log("📝 Request Body:", req.body);
  console.log("📁 Has File:", !!file);

  // Validate moduleId from URL params
  if (!moduleId || isNaN(parseInt(moduleId))) {
    return res.status(400).json({
      success: false,
      message: "Valid moduleId is required in URL",
      hint: "URL should be: POST /api/modules/YOUR_MODULE_ID/lessons",
      received: moduleId
    });
  }

  // Validate file
  if (!file) {
    return res.status(400).json({ 
      success: false,
      message: "File is required",
      hint: "Make sure: 1. Body is form-data 2. Field name is 'file' 3. Type is 'File'"
    });
  }

  // Create contentUrl
  const contentUrl = `/uploads/course-videos/${file.filename}`;
  
  console.log("✅ File uploaded successfully:");
  console.log("   Name:", file.originalname);
  console.log("   Saved As:", file.filename);
  console.log("   URL:", contentUrl);
  console.log("   Type:", file.mimetype);

  try {
    const lesson = await lessonService.createLesson({
      moduleId: parseInt(moduleId),  // Convert to number
      title: title || "Untitled Lesson",
      contentType: contentType || "VIDEO",
      order: parseInt(order) || 1,
      contentUrl,
    });

    res.status(201).json({ 
      success: true,
      message: "🎉 Lesson created successfully!",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        contentType: lesson.contentType,
        order: lesson.order,
        contentUrl: lesson.contentUrl,
        moduleId: lesson.moduleId
      },
      fileInfo: {
        originalName: file.originalname,
        savedAs: file.filename,
        url: contentUrl,
        size: `${(file.size / 1024).toFixed(2)} KB`
      }
    });
    
  } catch (error) {
    console.error("❌ Database error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create lesson",
      error: error.message,
      debug: {
        moduleId: moduleId,
        parsedModuleId: parseInt(moduleId)
      }
    });
  }
});

// Update lesson
export const updateLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { title, contentType, order } = req.body;
  const file = req.file;

  console.log("📝 Updating lesson ID:", lessonId);

  const updates = {
    title,
    contentType,
    order: order ? parseInt(order) : undefined,
  };

  // Update file only if new file is provided
  if (file) {
    updates.contentUrl = `/uploads/course-videos/${file.filename}`;
    console.log("📁 New file uploaded:", file.filename);
  }

  const lesson = await lessonService.updateLesson(parseInt(lessonId), updates);
  
  res.json({ 
    success: true,
    message: "Lesson updated successfully",
    lesson
  });
});

// Delete lesson
export const deleteLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  
  console.log("🗑️ Deleting lesson ID:", lessonId);
  
  await lessonService.deleteLesson(parseInt(lessonId));
  
  res.json({ 
    success: true,
    message: "Lesson deleted successfully"
  });
});

// List lessons of a module
export const listLessons = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  
  console.log("📋 Listing lessons for module ID:", moduleId);
  
  const lessons = await lessonService.listLessons(parseInt(moduleId));
  
  res.json({
    success: true,
    count: lessons.length,
    moduleId: moduleId,
    lessons
  });
});