import * as enrollmentService from "../services/enrollmentService.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const freeEnroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const enrollment = await enrollmentService.enrollFreeCourse(req.user.userId, Number(courseId));
  res.status(201).json(enrollment);
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getUserEnrollments(req.user.userId);
  res.json(enrollments);
});
