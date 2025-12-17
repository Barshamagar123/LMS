// controllers/instructorController.js
import * as courseService from "../services/courseService.js";
import * as instructorService from "../services/instructorService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getFileUrl } from "../config/multer.js"; // Import the helper

// ============ DASHBOARD & COURSE FUNCTIONS ============

// Get instructor dashboard data
export const getInstructorDashboard = asyncHandler(async (req, res) => {
  const instructorId = req.user.userId;

  const stats = await courseService.getInstructorStats(instructorId);
  const courses = await courseService.getInstructorCourses(instructorId);
  const recentActivity = await courseService.getInstructorRecentActivity(instructorId, 10);

  res.json({ stats, courses, recentActivity });
});

// Get student progress for a specific course
export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.userId;

  const progress = await courseService.getCourseStudentProgress(courseId, instructorId);
  res.json(progress);
});

// Create new course
export const createCourse = asyncHandler(async (req, res) => {
  const instructorId = req.user.userId;
  const { title, description, price, categoryId } = req.body;

  const course = await courseService.createCourse({ title, description, price, categoryId, instructorId });
  res.status(201).json(course);
});

// ============ PROFILE FUNCTIONS ============

// Complete instructor profile (for new instructors)
export const completeProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { 
    title, 
    bio, 
    profilePicture, 
    company, 
    experience, 
    website, 
    linkedin, 
    github, 
    twitter 
  } = req.body;

  // Validate required fields
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Professional title is required" });
  }

  if (!bio || !bio.trim()) {
    return res.status(400).json({ message: "Bio is required" });
  }

  const profileData = {
    title: title.trim(),
    bio: bio.trim(),
    profilePicture,
    company: company?.trim(),
    experience: experience ? parseInt(experience) : null,
    website: website?.trim(),
    linkedin: linkedin?.trim(),
    github: github?.trim(),
    twitter: twitter?.trim(),
    profileCompleted: true
  };

  const updatedUser = await instructorService.completeProfile(userId, profileData);
  
  res.json({
    message: "Profile completed successfully",
    user: updatedUser
  });
});

// Get instructor profile - UPDATED to ensure correct URL
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const profile = await instructorService.getProfile(userId);
  
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  // Ensure profile picture has correct path
  if (profile.profilePicture && !profile.profilePicture.includes('/profile-pictures/')) {
    const filename = profile.profilePicture.split('/').pop();
    profile.profilePicture = `/uploads/profile-pictures/${filename}`;
  }

  res.json(profile);
});

// Check if profile is complete (for frontend validation) - ADDED THIS FUNCTION
export const checkProfileStatus = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const user = await instructorService.getProfile(userId);
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isComplete = user.profileCompleted === true;
  const missingFields = [];

  if (!user.title) missingFields.push("professional title");
  if (!user.bio) missingFields.push("bio");
  if (!user.profilePicture) missingFields.push("profile picture");

  res.json({
    profileCompleted: isComplete,
    hasProfileData: !!(user.title || user.bio || user.profilePicture),
    missingFields,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      bio: user.bio,
      profilePicture: user.profilePicture,
      company: user.company,
      experience: user.experience,
      website: user.website,
      linkedin: user.linkedin,
      github: user.github,
      twitter: user.twitter
    }
  });
});

// Update instructor profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const updates = req.body;

  // Validate updates
  const allowedFields = [
    'title', 'bio', 'profilePicture', 'company', 'experience', 
    'website', 'linkedin', 'github', 'twitter'
  ];

  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      if (key === 'experience' && updates[key] !== undefined) {
        filteredUpdates[key] = parseInt(updates[key]);
      } else if (updates[key] !== undefined && updates[key] !== null) {
        filteredUpdates[key] = updates[key];
      }
    }
  });

  // Add profileCompleted flag if any field is updated
  if (Object.keys(filteredUpdates).length > 0) {
    filteredUpdates.profileCompleted = true;
  }

  const updatedUser = await instructorService.updateProfile(userId, filteredUpdates);
  
  res.json({
    message: "Profile updated successfully",
    user: updatedUser
  });
});

// Upload profile picture - UPDATED
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Use the helper function to get correct URL
  const profilePictureUrl = getFileUrl(req.file, 'profilePicture');
  
  const updatedUser = await instructorService.updateProfile(userId, {
    profilePicture: profilePictureUrl,
    profileCompleted: true
  });

  res.json({
    message: "Profile picture uploaded successfully",
    url: profilePictureUrl,
    user: updatedUser
  });
});