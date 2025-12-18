import * as enrollmentService from "../services/enrollmentService.js";
import asyncHandler from "../middleware/asyncHandler.js";

/**
 * @desc    Enroll in a free course
 * @route   POST /api/enrollments/free
 * @access  Private (Student)
 */
export const freeEnroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  
  try {
    const enrollment = await enrollmentService.enrollFreeCourse(
      req.user.userId, 
      Number(courseId)
    );
    
    res.status(201).json({
      success: true,
      message: "Successfully enrolled in the course",
      data: enrollment
    });
    
  } catch (error) {
    // Check if it's a duplicate enrollment error
    if (error.message === "Already enrolled in this course" || error.status === 409) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
        code: "ALREADY_ENROLLED"
      });
    }
    
    // Pass other errors to asyncHandler
    throw error;
  }
});

/**
 * @desc    Get all enrollments for current user
 * @route   GET /api/enrollments/me
 * @access  Private (Student)
 */
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getUserEnrollments(req.user.userId);
  
  res.json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

/**
 * @desc    Check if user is enrolled in a specific course
 * @route   GET /api/enrollments/check/:courseId
 * @access  Private (Student)
 */
export const checkCourseEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  const enrollment = await enrollmentService.checkEnrollment(
    req.user.userId, 
    Number(courseId)
  );
  
  res.json({
    success: true,
    isEnrolled: !!enrollment,
    data: enrollment || null
  });
});

/**
 * @desc    Get enrollment by ID
 * @route   GET /api/enrollments/:enrollmentId
 * @access  Private (Student - must own the enrollment)
 */
export const getEnrollmentById = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  
  const enrollment = await enrollmentService.getEnrollmentById(
    Number(enrollmentId),
    req.user.userId
  );
  
  res.json({
    success: true,
    data: enrollment
  });
});

/**
 * @desc    Update enrollment status (for admin or system)
 * @route   PUT /api/enrollments/:enrollmentId/status
 * @access  Private (Admin/Instructor)
 */
export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { status } = req.body;
  
  const enrollment = await enrollmentService.updateEnrollmentStatus(
    Number(enrollmentId),
    status
  );
  
  res.json({
    success: true,
    message: "Enrollment status updated",
    data: enrollment
  });
});

/**
 * @desc    Get course statistics (for instructor)
 * @route   GET /api/enrollments/course/:courseId/stats
 * @access  Private (Instructor/Admin)
 */
export const getCourseEnrollmentStats = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  // Check if user is instructor of this course
  const stats = await enrollmentService.getCourseEnrollmentStats(
    Number(courseId),
    req.user.userId
  );
  
  res.json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Unenroll from a course (student can unenroll themselves)
 * @route   DELETE /api/enrollments/:enrollmentId
 * @access  Private (Student/Admin)
 */
export const unenrollFromCourse = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  
  await enrollmentService.unenrollCourse(
    Number(enrollmentId),
    req.user.userId,
    req.user.role
  );
  
  res.json({
    success: true,
    message: "Successfully unenrolled from the course"
  });
});

/**
 * @desc    Get all enrollments for a course (for instructor/admin)
 * @route   GET /api/enrollments/course/:courseId
 * @access  Private (Instructor/Admin)
 */
export const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  
  const result = await enrollmentService.getCourseEnrollments(
    Number(courseId),
    req.user.userId,
    req.user.role,
    {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    }
  );
  
  res.json({
    success: true,
    ...result
  });
});

/**
 * @desc    Get enrollment analytics
 * @route   GET /api/enrollments/analytics
 * @access  Private (Admin)
 */
export const getEnrollmentAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const analytics = await enrollmentService.getEnrollmentAnalytics(
    startDate,
    endDate
  );
  
  res.json({
    success: true,
    data: analytics
  });
});

/**
 * @desc    Get popular courses based on enrollments
 * @route   GET /api/enrollments/popular-courses
 * @access  Public
 */
export const getPopularCourses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const courses = await enrollmentService.getPopularCourses(
    parseInt(limit)
  );
  
  res.json({
    success: true,
    data: courses
  });
});

/**
 * @desc    Update last accessed time for enrollment
 * @route   PUT /api/enrollments/:enrollmentId/last-accessed
 * @access  Private (Student)
 */
export const updateLastAccessed = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  
  const enrollment = await enrollmentService.updateLastAccessed(
    Number(enrollmentId),
    req.user.userId
  );
  
  res.json({
    success: true,
    data: enrollment
  });
});