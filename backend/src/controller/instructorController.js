// controllers/instructorController.js
import * as courseService from "../services/courseService.js";
import * as instructorService from "../services/instructorService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getFileUrl } from "../config/multer.js";

// Helper function to fix profile picture URL
const fixProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  
  // If it's already a full URL, return as is
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }
  
  // If it starts with uploads/ (no leading slash), add slash
  if (profilePicture.startsWith('uploads/')) {
    return `/${profilePicture}`;
  }
  
  // If it starts with /uploads/, it's already correct
  if (profilePicture.startsWith('/uploads/')) {
    return profilePicture;
  }
  
  // If it's just a filename, add the full path
  if (!profilePicture.includes('/')) {
    return `/uploads/profile-pictures/${profilePicture}`;
  }
  
  // For any other case, return as is
  return profilePicture;
};

// ============ PUBLIC FUNCTIONS ============

// List all approved and active instructors (Public endpoint)
export const listInstructors = asyncHandler(async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const { 
      page = 1, 
      limit = 12, 
      search = '',
      sort = 'featured',
      order = 'desc'
    } = req.query;

    console.log('API Called - listInstructors:', { page, limit, search, sort, order });

    // Convert to numbers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const offset = (pageNum - 1) * limitNum;

    // Build filter object
    const filters = {};
    
    if (search) {
      filters.search = search.trim();
    }

    // Get instructors with filtering and pagination
    const result = await instructorService.getAllInstructors({
      filters,
      sort,
      order: order === 'desc' ? 'desc' : 'asc',
      limit: limitNum,
      offset
    });

    console.log('Service result received:', {
      instructorsCount: result?.instructors?.length || 0,
      total: result?.total || 0
    });

    // Process instructors to ensure profile pictures have correct URLs
    const processedInstructors = (result.instructors || []).map(instructor => {
      const processedInstructor = { ...instructor };
      
      // Fix profile picture URL
      processedInstructor.profilePicture = fixProfilePictureUrl(instructor.profilePicture);
      
      // Ensure stats are properly structured
      if (!processedInstructor.stats) {
        processedInstructor.stats = {
          totalCourses: instructor.courseCount || instructor._count?.courses || 0,
          totalStudents: instructor.stats?.totalStudents || 0,
          averageRating: instructor.stats?.averageRating || 0,
          totalReviews: instructor.stats?.totalReviews || 0
        };
      }

      return processedInstructor;
    });

    // Get featured instructors
    let featuredInstructors = [];
    try {
      featuredInstructors = await instructorService.getFeaturedInstructors(3) || [];
    } catch (featuredError) {
      console.error('Error getting featured instructors, using fallback:', featuredError);
      // Use first 3 instructors as featured
      featuredInstructors = processedInstructors.slice(0, 3).map(instructor => ({
        id: instructor.id,
        name: instructor.name,
        title: instructor.title,
        profilePicture: instructor.profilePicture,
        company: instructor.company,
        rating: instructor.stats?.averageRating || 0,
        totalCourses: instructor.stats?.totalCourses || 0
      }));
    }
    
    // Fix URLs for featured instructors
    const processedFeaturedInstructors = featuredInstructors.map(instructor => ({
      id: instructor.id,
      name: instructor.name,
      title: instructor.title,
      profilePicture: fixProfilePictureUrl(instructor.profilePicture),
      company: instructor.company,
      rating: instructor.averageRating || instructor.rating || 0,
      totalCourses: instructor.totalCourses || instructor.stats?.totalCourses || 0
    }));

    // Get popular categories
    let popularCategories = [];
    try {
      popularCategories = await instructorService.getInstructorCategories() || [];
    } catch (categoryError) {
      console.error('Error getting categories:', categoryError);
      popularCategories = [];
    }

    const response = {
      success: true,
      data: {
        instructors: processedInstructors,
        pagination: {
          currentPage: pageNum,
          totalPages: result.totalPages || 1,
          totalInstructors: result.total || processedInstructors.length,
          limit: limitNum,
          hasNextPage: pageNum < (result.totalPages || 1),
          hasPrevPage: pageNum > 1
        },
        featuredInstructors: processedFeaturedInstructors,
        popularCategories: popularCategories || [],
        filters: {
          search,
          sort,
          order
        }
      }
    };

    console.log('Sending response with', processedInstructors.length, 'instructors');
    res.json(response);

  } catch (error) {
    console.error('Error in listInstructors:', error);
    console.error('Error stack:', error.stack);
    
    // Return empty but successful response to prevent frontend crash
    res.json({
      success: true,
      data: {
        instructors: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalInstructors: 0,
          limit: 12,
          hasNextPage: false,
          hasPrevPage: false
        },
        featuredInstructors: [],
        popularCategories: [],
        filters: {
          search: req.query.search || '',
          sort: req.query.sort || 'featured',
          order: req.query.order || 'desc'
        }
      }
    });
  }
});

// Get instructor public profile (Public endpoint)
export const getInstructorPublicProfile = asyncHandler(async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!instructorId) {
      return res.status(400).json({ 
        success: false, 
        message: "Instructor ID is required" 
      });
    }

    console.log('Getting public profile for instructor:', instructorId);

    // Convert to number
    const id = parseInt(instructorId);
    
    const instructor = await instructorService.getInstructorPublicProfile(id);

    if (!instructor) {
      return res.status(404).json({ 
        success: false, 
        message: "Instructor not found" 
      });
    }

    // Fix profile picture URL
    instructor.profilePicture = fixProfilePictureUrl(instructor.profilePicture);

    // Get instructor's courses
    const courses = await instructorService.getInstructorPublicCourses(id);
    
    // Get instructor stats
    const stats = await instructorService.getInstructorStats(id);

    // Get similar instructors
    const similarInstructors = await instructorService.getSimilarInstructors(id, 3);
    
    // Fix URLs for similar instructors
    const processedSimilarInstructors = similarInstructors.map(instructor => ({
      id: instructor.id,
      name: instructor.name,
      title: instructor.title,
      profilePicture: fixProfilePictureUrl(instructor.profilePicture),
      company: instructor.company,
      rating: instructor.averageRating || 0
    }));

    const response = {
      success: true,
      data: {
        instructor: {
          id: instructor.id,
          name: instructor.name,
          title: instructor.title,
          bio: instructor.bio,
          profilePicture: instructor.profilePicture,
          company: instructor.company,
          experience: instructor.experience,
          website: instructor.website,
          linkedin: instructor.linkedin,
          github: instructor.github,
          twitter: instructor.twitter,
          averageRating: stats?.averageRating || 0,
          totalReviews: stats?.totalReviews || 0,
          createdAt: instructor.createdAt,
          isApproved: instructor.isApproved,
          isActive: instructor.isActive
        },
        stats: {
          totalCourses: stats?.totalCourses || 0,
          totalStudents: stats?.totalStudents || 0,
          averageRating: stats?.averageRating || 0,
          totalReviews: stats?.totalReviews || 0
        },
        courses: courses || [],
        similarInstructors: processedSimilarInstructors
      }
    };

    console.log('Sending instructor profile for:', instructor.name);
    res.json(response);

  } catch (error) {
    console.error('Error in getInstructorPublicProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch instructor profile", 
      error: error.message 
    });
  }
});

// ============ PROFILE FUNCTIONS ============

// Complete instructor profile
export const completeProfile = asyncHandler(async (req, res) => {
  try {
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

    console.log('Completing profile for user:', userId, req.body);

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
      profilePicture: profilePicture ? fixProfilePictureUrl(profilePicture) : null,
      company: company?.trim(),
      experience: experience ? parseInt(experience) : null,
      website: website?.trim(),
      linkedin: linkedin?.trim(),
      github: github?.trim(),
      twitter: twitter?.trim(),
      profileCompleted: true
    };

    const updatedUser = await instructorService.completeProfile(userId, profileData);
    
    console.log('Profile completed successfully for user:', userId);
    res.json({
      message: "Profile completed successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in completeProfile:', error);
    res.status(500).json({ 
      message: "Failed to complete profile", 
      error: error.message 
    });
  }
});

// Get instructor profile
export const getProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('Getting profile for user:', userId);
    
    const profile = await instructorService.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Fix profile picture URL
    profile.profilePicture = fixProfilePictureUrl(profile.profilePicture);

    console.log('Profile found for user:', profile.name);
    res.json(profile);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ 
      message: "Failed to fetch profile", 
      error: error.message 
    });
  }
});

// Check if profile is complete
export const checkProfileStatus = asyncHandler(async (req, res) => {
  try {
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

    // Fix profile picture URL
    user.profilePicture = fixProfilePictureUrl(user.profilePicture);

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
        twitter: user.twitter,
        isApproved: user.isApproved,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error in checkProfileStatus:', error);
    res.status(500).json({ 
      message: "Failed to check profile status", 
      error: error.message 
    });
  }
});

// Update instructor profile
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    console.log('Updating profile for user:', userId, updates);

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
        } else if (key === 'profilePicture' && updates[key]) {
          filteredUpdates[key] = fixProfilePictureUrl(updates[key]);
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
    
    console.log('Profile updated successfully for user:', userId);
    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ 
      message: "Failed to update profile", 
      error: error.message 
    });
  }
});

// Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log('Uploading profile picture for user:', userId, req.file);

    // Use the helper function to get correct URL
    const profilePictureUrl = getFileUrl(req.file, 'profilePicture');
    
    const updatedUser = await instructorService.updateProfile(userId, {
      profilePicture: profilePictureUrl,
      profileCompleted: true
    });

    console.log('Profile picture uploaded successfully for user:', userId);
    res.json({
      message: "Profile picture uploaded successfully",
      url: profilePictureUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    res.status(500).json({ 
      message: "Failed to upload profile picture", 
      error: error.message 
    });
  }
});

// ============ DASHBOARD & COURSE FUNCTIONS ============

// Get instructor dashboard data
export const getInstructorDashboard = asyncHandler(async (req, res) => {
  try {
    const instructorId = req.user.userId;

    console.log('Getting dashboard for instructor:', instructorId);

    const stats = await courseService.getInstructorStats(instructorId);
    const courses = await courseService.getInstructorCourses(instructorId);
    const recentActivity = await courseService.getInstructorRecentActivity(instructorId, 10);

    console.log('Dashboard data retrieved for instructor:', instructorId);
    res.json({ stats, courses, recentActivity });
  } catch (error) {
    console.error('Error in getInstructorDashboard:', error);
    res.status(500).json({ 
      message: "Failed to fetch dashboard data", 
      error: error.message 
    });
  }
});

// Get student progress for a specific course
export const getCourseProgress = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.userId;

    console.log('Getting progress for course:', courseId, 'instructor:', instructorId);

    const progress = await courseService.getCourseStudentProgress(courseId, instructorId);
    
    console.log('Progress data retrieved for course:', courseId);
    res.json(progress);
  } catch (error) {
    console.error('Error in getCourseProgress:', error);
    res.status(500).json({ 
      message: "Failed to fetch course progress", 
      error: error.message 
    });
  }
});

// Create new course
export const createCourse = asyncHandler(async (req, res) => {
  try {
    const instructorId = req.user.userId;
    const { title, description, price, categoryId } = req.body;

    console.log('Creating course for instructor:', instructorId, req.body);

    const course = await courseService.createCourse({ 
      title, 
      description, 
      price, 
      categoryId, 
      instructorId 
    });
    
    console.log('Course created successfully:', course.id);
    res.status(201).json(course);
  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({ 
      message: "Failed to create course", 
      error: error.message 
    });
  }
});