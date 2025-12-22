// routes/instructorRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploads, handleMulterError, getFileUrl } from "../config/multer.js"; // Added getFileUrl import
import {
  getInstructorDashboard,
  getCourseProgress,
  createCourse,
  completeProfile,
  getProfile,
  updateProfile,
  checkProfileStatus,
  uploadProfilePicture
} from "../controller/instructorController.js";

// Import prisma for public routes
import prisma from "../config/prisma.js";

const router = express.Router();

// ============ PUBLIC INSTRUCTOR ROUTES ============

// Get all public instructors with stats
router.get("/public", async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', sort = 'featured' } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      role: "INSTRUCTOR",
      profileCompleted: true,
      courses: {
        some: {
          status: "PUBLISHED"
        }
      }
    };

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    let orderBy = {};
    switch(sort) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'courses':
        orderBy = { courses: { _count: 'desc' } };
        break;
      case 'experience':
        orderBy = { experience: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default: // 'featured'
        orderBy = { createdAt: 'desc' };
    }

    // First, get the basic instructor data
    console.log('Query params:', { where, orderBy, skip, limit: parseInt(limit) });

    const instructors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        profilePicture: true,
        company: true,
        experience: true,
        website: true,
        linkedin: true,
        github: true,
        twitter: true,
        createdAt: true,
        _count: {
          select: {
            courses: {
              where: { status: "PUBLISHED" }
            }
          }
        }
      },
      orderBy,
      skip,
      take: parseInt(limit)
    });

    console.log('Found instructors:', instructors.length);

    // Get total count
    const total = await prisma.user.count({ where });

    // For each instructor, get their courses with enrollments and reviews
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        const courses = await prisma.course.findMany({
          where: {
            instructorId: instructor.id,
            status: "PUBLISHED"
          },
          select: {
            enrollments: true,
            reviews: {
              select: {
                rating: true
              }
            }
          }
        });

        const courseCount = instructor._count.courses;

        // Calculate total students
        const totalStudents = courses.reduce((sum, course) =>
          sum + course.enrollments.length, 0
        );

        // Calculate average rating
        const allRatings = courses.flatMap(course =>
          course.reviews.map(review => review.rating)
        );
        const averageRating = allRatings.length > 0
          ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
          : null;

        // Determine if featured (has 3+ courses and good rating)
        const featured = courseCount >= 3 && (averageRating === null || averageRating >= 4.0);

        return {
          ...instructor,
          courseCount,
          totalStudents,
          averageRating,
          featured,
          // Remove sensitive data
          _count: undefined
        };
      })
    );

    res.json({
      instructors: instructorsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Error fetching instructors", error: error.message });
  }
});

// Get single public instructor profile
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await prisma.user.findUnique({
      where: {
        id: Number(id),
        role: "INSTRUCTOR",
        profileCompleted: true
      },
      include: {
        courses: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            price: true,
            category: true,
            level: true,
            duration: true,
            createdAt: true,
            _count: {
              select: {
                enrollments: true,
                reviews: true
              }
            },
            reviews: {
              select: {
                rating: true,
                comment: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Calculate instructor stats
    const courseCount = instructor.courses.length;
    const totalStudents = instructor.courses.reduce((sum, course) => 
      sum + course._count.enrollments, 0
    );
    
    const allRatings = instructor.courses.flatMap(course => 
      course.reviews.map(review => review.rating)
    );
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : null;

    // Calculate individual course ratings
    const coursesWithRatings = instructor.courses.map(course => {
      const courseRatings = course.reviews.map(review => review.rating);
      const courseAverageRating = courseRatings.length > 0 
        ? courseRatings.reduce((sum, rating) => sum + rating, 0) / courseRatings.length
        : null;
      
      return {
        ...course,
        averageRating: courseAverageRating,
        reviewCount: course.reviews.length,
        reviews: undefined // Remove review details
      };
    });

    const instructorWithStats = {
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
      createdAt: instructor.createdAt,
      courseCount,
      totalStudents,
      averageRating,
      courses: coursesWithRatings
    };

    res.json(instructorWithStats);
  } catch (error) {
    console.error("Error fetching instructor:", error);
    res.status(500).json({ message: "Error fetching instructor" });
  }
});

// Search instructors by query
router.get("/public/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    
    const instructors = await prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        profileCompleted: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        title: true,
        company: true,
        profilePicture: true,
        _count: {
          select: {
            courses: {
              where: { status: "PUBLISHED" }
            }
          }
        }
      },
      take: 10
    });

    res.json(instructors);
  } catch (error) {
    console.error("Error searching instructors:", error);
    res.status(500).json({ message: "Error searching instructors" });
  }
});

// ============ AUTHENTICATED INSTRUCTOR ROUTES ============

// Profile routes
router.post("/complete-profile", authMiddleware, roleMiddleware(["INSTRUCTOR"]), completeProfile);
router.get("/profile", authMiddleware, roleMiddleware(["INSTRUCTOR"]), getProfile);
router.patch("/profile", authMiddleware, roleMiddleware(["INSTRUCTOR"]), updateProfile);
router.get("/profile/status", authMiddleware, roleMiddleware(["INSTRUCTOR"]), checkProfileStatus);

// Profile picture upload
router.post("/profile/upload-picture", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]),
  uploads.profilePicture.single('profilePicture'),
  handleMulterError,
  uploadProfilePicture
);

// Course thumbnail upload
router.post("/courses/:courseId/thumbnail",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  uploads.courseThumbnail.single('thumbnail'),
  handleMulterError,
  (req, res) => {
    const thumbnailUrl = getFileUrl(req.file, 'courseThumbnail');
    res.json({ url: thumbnailUrl });
  }
);

// Course video upload
router.post("/courses/:courseId/video",
  authMiddleware,
  roleMiddleware(["INSTRUCTOR"]),
  uploads.courseVideo.single('video'),
  handleMulterError,
  (req, res) => {
    const videoUrl = getFileUrl(req.file, 'courseVideo');
    res.json({ url: videoUrl });
  }
);

// Dashboard and course management routes
router.use(authMiddleware, roleMiddleware(["INSTRUCTOR"]));
router.get("/dashboard", getInstructorDashboard);
router.get("/courses/:courseId/progress", getCourseProgress);
router.post("/courses", createCourse);

export default router;
