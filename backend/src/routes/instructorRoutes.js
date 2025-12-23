// routes/instructorRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploads, handleMulterError, getFileUrl } from "../config/multer.js";

// Import ALL instructor controller functions including the new ones
import {
  getInstructorDashboard,
  getCourseProgress,
  createCourse,
  completeProfile,
  getProfile,
  updateProfile,
  checkProfileStatus,
  uploadProfilePicture,
  listInstructors,           // NEW: Added for public listing
  getInstructorPublicProfile // NEW: Added for public profile view
} from "../controller/instructorController.js";

const router = express.Router();

// ============ PUBLIC INSTRUCTOR ROUTES ============

// OPTION 1: Use the controller function for public listing (Recommended)
router.get("/public", listInstructors);

// OR keep your existing implementation but using the controller pattern:
// router.get("/public", async (req, res) => {
//   try {
//     // Your existing implementation here...
//   } catch (error) {
//     // Error handling...
//   }
// });

// Get single public instructor profile using controller
router.get("/public/:id", getInstructorPublicProfile);

// OR keep your existing implementation:
// router.get("/public/:id", async (req, res) => {
//   try {
//     // Your existing implementation here...
//   } catch (error) {
//     // Error handling...
//   }
// });

// Search instructors by query - Keep this separate if you want quick search
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

// ============ PROTECTED INSTRUCTOR ROUTES ============

// Profile routes
router.post("/complete-profile", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  completeProfile
);

router.get("/profile", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  getProfile
);

router.patch("/profile", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  updateProfile
);

router.get("/profile/status", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  checkProfileStatus
);

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
// These all require authentication and instructor role
router.get("/dashboard", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  getInstructorDashboard
);

router.get("/courses/:courseId/progress", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  getCourseProgress
);

router.post("/courses", 
  authMiddleware, 
  roleMiddleware(["INSTRUCTOR"]), 
  createCourse
);

// ============ ADDITIONAL INSTRUCTOR ROUTES ============

// Get instructor's courses (for their dashboard or public view)
router.get("/:instructorId/courses", async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { status = "PUBLISHED" } = req.query;

    const courses = await prisma.course.findMany({
      where: {
        instructorId: parseInt(instructorId),
        status: status.toUpperCase(),
        instructor: {
          role: "INSTRUCTOR",
          profileCompleted: true
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        price: true,
        level: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
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
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average rating for each course
    const coursesWithRatings = courses.map(course => {
      const ratings = course.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null;

      return {
        ...course,
        averageRating,
        reviews: undefined // Remove detailed reviews from response
      };
    });

    res.json({
      success: true,
      data: coursesWithRatings
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching instructor courses" 
    });
  }
});

// Get instructor reviews
router.get("/:instructorId/reviews", async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: {
        course: {
          instructorId: parseInt(instructorId)
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.review.count({
      where: {
        course: {
          instructorId: parseInt(instructorId)
        }
      }
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching instructor reviews:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching instructor reviews" 
    });
  }
});

// Get top instructors (for homepage)
router.get("/top", async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const topInstructors = await prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        profileCompleted: true,
        courses: {
          some: {
            status: "PUBLISHED"
          }
        }
      },
      select: {
        id: true,
        name: true,
        title: true,
        profilePicture: true,
        company: true,
        _count: {
          select: {
            courses: {
              where: { status: "PUBLISHED" }
            }
          }
        }
      },
      orderBy: {
        courses: {
          _count: 'desc'
        }
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: topInstructors
    });
  } catch (error) {
    console.error("Error fetching top instructors:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching top instructors" 
    });
  }
});

// Get instructors by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const instructors = await prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        profileCompleted: true,
        courses: {
          some: {
            categoryId: parseInt(categoryId),
            status: "PUBLISHED"
          }
        }
      },
      select: {
        id: true,
        name: true,
        title: true,
        profilePicture: true,
        company: true,
        _count: {
          select: {
            courses: {
              where: { 
                categoryId: parseInt(categoryId),
                status: "PUBLISHED"
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.user.count({
      where: {
        role: "INSTRUCTOR",
        profileCompleted: true,
        courses: {
          some: {
            categoryId: parseInt(categoryId),
            status: "PUBLISHED"
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        instructors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching instructors by category:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching instructors by category" 
    });
  }
});

export default router;