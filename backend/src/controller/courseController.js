import * as courseService from "../services/courseService.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { getFileUrl } from "../config/multer.js";

export const listCourses = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    price: req.query.price,
    rating_min: req.query.rating_min,
    q: req.query.q,
    page: req.query.page || 1,
    per_page: req.query.per_page || 12
  };
  const result = await courseService.getCourses(filters);
  res.json(result);
});

export const courseDetails = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseDetails(Number(req.params.id));
  if (!course) return res.status(404).json({ message: "Course not found" });
  const recommendations = await courseService.recommendCourses(4, course.id);
  res.json({ course, recommendations });
});

// Instructor CRUD - UPDATED to handle thumbnail
export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, categoryId } = req.body;
  
  // Get thumbnail URL if file was uploaded
  let thumbnail = null;
  if (req.file) {
    thumbnail = getFileUrl(req.file, 'courseThumbnail');
  }
  
  const course = await courseService.createCourse({
    title, 
    description, 
    price, 
    categoryId, 
    instructorId: req.user.userId,
    thumbnail
  });
  
  res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const updates = req.body;
  
  // Handle thumbnail if file was uploaded
  if (req.file) {
    updates.thumbnail = getFileUrl(req.file, 'courseThumbnail');
  }
  
  const course = await courseService.updateCourse(Number(req.params.id), updates);
  res.json(course);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(Number(req.params.id));
  res.json({ message: "Course deleted" });
});

export const instructorCourses = asyncHandler(async (req, res) => {
  const data = await courseService.getInstructorCourses(req.user.userId);
  res.json(data);
});

export const instructorStats = asyncHandler(async (req, res) => {
  const stats = await courseService.getInstructorStats(req.user.userId);
  res.json(stats);
});

// NEW: Separate thumbnail upload endpoint (optional)
export const uploadCourseThumbnail = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.id);
  
  if (!req.file) {
    return res.status(400).json({ message: "No thumbnail file uploaded" });
  }
  
  // Get thumbnail URL
  const thumbnail = getFileUrl(req.file, 'courseThumbnail');
  
  // Update course with thumbnail
  const updatedCourse = await courseService.updateCourse(courseId, { 
    thumbnail 
  });
  
  res.json({
    message: "Thumbnail uploaded successfully",
    thumbnail,
    course: updatedCourse
  });
});