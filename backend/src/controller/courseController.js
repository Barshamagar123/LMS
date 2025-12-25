import * as courseService from "../services/courseService.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { getFileUrl } from "../config/multer.js";
import prisma from "../config/prisma.js";

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
  const courseId = Number(req.params.id);
  if (isNaN(courseId)) {
    return res.status(400).json({ message: "Invalid course id" });
  }
  const course = await courseService.getCourseDetails(courseId);
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
  const courseId = Number(req.params.id);
  if (isNaN(courseId)) {
    return res.status(400).json({ message: "Invalid course id" });
  }
  const updates = req.body;

  // Handle thumbnail if file was uploaded
  if (req.file) {
    updates.thumbnail = getFileUrl(req.file, 'courseThumbnail');
  }

  const course = await courseService.updateCourse(courseId, updates);
  res.json(course);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const courseId = Number(req.params.id);
  if (isNaN(courseId)) {
    return res.status(400).json({ message: "Invalid course id" });
  }
  await courseService.deleteCourse(courseId);
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
  if (isNaN(courseId)) {
    return res.status(400).json({ message: "Invalid course id" });
  }

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
/**
 * @desc    Get recommended courses for student
 * @route   GET /api/courses/recommended
 * @access  Private (Student)
 */
export const getRecommendedCourses = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const userId = req.user.userId;
  
  // Get user's enrolled course IDs to exclude
  const userEnrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true }
  });
  
  const enrolledCourseIds = userEnrollments.map(e => e.courseId);
  
  // Get recommended courses (excluding already enrolled)
  const recommended = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: enrolledCourseIds },
      price: 0 // Only free courses for recommendations
    },
    take: Number(limit),
    orderBy: { 
      rating: "desc",
      createdAt: "desc" 
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      rating: true,
      thumbnail: true,
      instructor: {
        select: {
          id: true,
          name: true,
          profilePicture: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      }
    }
  });
  
  const formattedCourses = recommended.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.instructor.name,
    instructorAvatar: course.instructor.profilePicture,
    price: course.price,
    rating: course.rating,
    thumbnail: course.thumbnail,
    category: course.category.name,
    enrollmentCount: course._count.enrollments,
    reviewCount: course._count.reviews,
    isFree: course.price === 0
  }));
  
  res.json({
    success: true,
    count: formattedCourses.length,
    data: formattedCourses
  });
});
