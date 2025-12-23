// services/instructorService.js
import prisma from "../config/prisma.js";

// ============ PROFILE SERVICES ============
// (Keep your existing profile services - they're fine)

// ============ PUBLIC INSTRUCTOR SERVICES ============

// Get all approved and active instructors
export const getAllInstructors = async ({ filters = {}, sort = 'featured', order = 'desc', limit = 12, offset = 0 }) => {
  try {
    const { search } = filters;
    
    let whereClause = {
      role: 'INSTRUCTOR',
      profileCompleted: true
    };

    // Add search filter
    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Build orderBy clause
    let orderBy = {};
    switch (sort) {
      case 'name':
        orderBy = { name: order };
        break;
      case 'courses':
        // We'll sort by course count after fetching
        orderBy = { createdAt: 'desc' };
        break;
      case 'experience':
        orderBy = { experience: order };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default: // 'featured'
        orderBy = { createdAt: 'desc' };
    }

    // Get total count
    const total = await prisma.user.count({ where: whereClause });

    // Get instructors with pagination
    const instructors = await prisma.user.findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        bio: true,
        profilePicture: true,
        company: true,
        experience: true,
        website: true,
        linkedin: true,
        github: true,
        twitter: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Get course count separately
        courses: {
          where: { status: 'PUBLISHED' },
          select: { id: true }
        }
      }
    });

    // Fix image URLs for all instructors
    const instructorsWithFixedUrls = instructors.map(instructor => ({
      ...instructor,
      profilePicture: instructor.profilePicture ? 
        (instructor.profilePicture.startsWith('/') ? 
          instructor.profilePicture : 
          `/uploads/profile-pictures/${instructor.profilePicture}`) 
        : null,
      // Calculate course count from courses array
      courseCount: instructor.courses.length
    }));

    // Get stats for each instructor
    const instructorsWithStats = await Promise.all(
      instructorsWithFixedUrls.map(async (instructor) => {
        try {
          const courses = await prisma.course.findMany({
            where: {
              instructorId: instructor.id,
              status: 'PUBLISHED'
            },
            select: {
              enrollments: {
                select: { id: true }
              },
              reviews: {
                select: { rating: true }
              }
            }
          });

          const courseCount = instructor.courseCount;
          const totalStudents = courses.reduce((sum, course) => sum + course.enrollments.length, 0);
          
          // Calculate average rating
          const allRatings = courses.flatMap(course => 
            course.reviews.map(review => review.rating)
          );
          const averageRating = allRatings.length > 0 
            ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
            : 0;

          const totalReviews = allRatings.length;

          return {
            ...instructor,
            stats: {
              totalCourses: courseCount,
              totalStudents,
              averageRating: parseFloat(averageRating.toFixed(1)),
              totalReviews
            }
          };
        } catch (error) {
          console.error(`Error getting stats for instructor ${instructor.id}:`, error);
          return {
            ...instructor,
            stats: {
              totalCourses: instructor.courseCount,
              totalStudents: 0,
              averageRating: 0,
              totalReviews: 0
            }
          };
        }
      })
    );

    // Sort by course count if requested
    if (sort === 'courses') {
      instructorsWithStats.sort((a, b) => {
        const aCourses = a.stats.totalCourses;
        const bCourses = b.stats.totalCourses;
        return order === 'desc' ? bCourses - aCourses : aCourses - bCourses;
      });
    }

    // Sort by rating if requested
    if (sort === 'rating') {
      instructorsWithStats.sort((a, b) => {
        const aRating = a.stats.averageRating;
        const bRating = b.stats.averageRating;
        return order === 'desc' ? bRating - aRating : aRating - bRating;
      });
    }

    const totalPages = Math.ceil(total / limit);

    return {
      instructors: instructorsWithStats,
      total,
      totalPages
    };

  } catch (error) {
    console.error('Error in getAllInstructors:', error);
    throw error;
  }
};

// Get featured instructors - FIXED VERSION
export const getFeaturedInstructors = async (limit = 3) => {
  try {
    const instructors = await prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        profileCompleted: true
      },
      select: {
        id: true,
        name: true,
        title: true,
        profilePicture: true,
        company: true,
        courses: {
          where: { status: 'PUBLISHED' },
          select: { id: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Fix image URLs and add ratings
    const featuredInstructors = await Promise.all(
      instructors.map(async (instructor) => {
        try {
          const courses = await prisma.course.findMany({
            where: {
              instructorId: instructor.id,
              status: 'PUBLISHED'
            },
            select: {
              reviews: {
                select: { rating: true }
              }
            }
          });

          const allRatings = courses.flatMap(course => 
            course.reviews.map(review => review.rating)
          );
          const averageRating = allRatings.length > 0 
            ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
            : 0;

          return {
            id: instructor.id,
            name: instructor.name,
            title: instructor.title,
            profilePicture: instructor.profilePicture ? 
              (instructor.profilePicture.startsWith('/') ? 
                instructor.profilePicture : 
                `/uploads/profile-pictures/${instructor.profilePicture}`) 
              : null,
            company: instructor.company,
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalCourses: instructor.courses.length
          };
        } catch (error) {
          console.error(`Error processing featured instructor ${instructor.id}:`, error);
          return {
            id: instructor.id,
            name: instructor.name,
            title: instructor.title,
            profilePicture: instructor.profilePicture ? 
              (instructor.profilePicture.startsWith('/') ? 
                instructor.profilePicture : 
                `/uploads/profile-pictures/${instructor.profilePicture}`) 
              : null,
            company: instructor.company,
            averageRating: 0,
            totalCourses: instructor.courses.length
          };
        }
      })
    );

    // Sort by rating (highest first)
    return featuredInstructors.sort((a, b) => b.averageRating - a.averageRating);

  } catch (error) {
    console.error('Error in getFeaturedInstructors:', error);
    return []; // Return empty array instead of throwing
  }
};

// Get popular categories among instructors - FIXED VERSION
export const getInstructorCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        courses: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      include: {
        courses: {
          where: { status: 'PUBLISHED' },
          select: { id: true }
        }
      },
      orderBy: {
        courses: {
          _count: 'desc'
        }
      },
      take: 8
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      courseCount: category.courses.length
    }));
  } catch (error) {
    console.error('Error in getInstructorCategories:', error);
    return [];
  }
};

// Get instructor public profile - FIXED VERSION
export const getInstructorPublicProfile = async (instructorId) => {
  try {
    const instructor = await prisma.user.findUnique({
      where: {
        id: parseInt(instructorId),
        role: 'INSTRUCTOR',
        profileCompleted: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        bio: true,
        profilePicture: true,
        company: true,
        experience: true,
        website: true,
        linkedin: true,
        github: true,
        twitter: true,
        isApproved: true,
        isActive: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (instructor) {
      instructor.profilePicture = instructor.profilePicture ? 
        (instructor.profilePicture.startsWith('/') ? 
          instructor.profilePicture : 
          `/uploads/profile-pictures/${instructor.profilePicture}`) 
        : null;
    }

    return instructor;
  } catch (error) {
    console.error('Error in getInstructorPublicProfile:', error);
    throw error;
  }
};

// Get instructor stats - FIXED VERSION
export const getInstructorStats = async (instructorId) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: parseInt(instructorId),
        status: 'PUBLISHED'
      },
      include: {
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
      }
    });

    const courseCount = courses.length;
    const totalStudents = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
    
    const totalRevenue = courses.reduce((sum, course) => 
      sum + (course.price * course._count.enrollments), 0
    );

    const allRatings = courses.flatMap(course => 
      course.reviews.map(review => review.rating)
    );
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : 0;

    const totalReviews = allRatings.length;

    return {
      totalCourses: courseCount,
      totalStudents,
      totalRevenue,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews
    };
  } catch (error) {
    console.error('Error in getInstructorStats:', error);
    return {
      totalCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalReviews: 0
    };
  }
};

// Get similar instructors - FIXED VERSION
export const getSimilarInstructors = async (instructorId, limit = 3) => {
  try {
    // Get instructor's course categories
    const instructorCourses = await prisma.course.findMany({
      where: {
        instructorId: parseInt(instructorId),
        status: 'PUBLISHED'
      },
      select: {
        categoryId: true
      },
      distinct: ['categoryId']
    });

    const categoryIds = instructorCourses.map(course => course.categoryId).filter(Boolean);

    if (categoryIds.length === 0) {
      return await getFeaturedInstructors(limit);
    }

    // Get instructors teaching similar categories
    const similarInstructors = await prisma.user.findMany({
      where: {
        id: { not: parseInt(instructorId) },
        role: 'INSTRUCTOR',
        profileCompleted: true,
        courses: {
          some: {
            categoryId: { in: categoryIds },
            status: 'PUBLISHED'
          }
        }
      },
      distinct: ['id'],
      take: limit,
      select: {
        id: true,
        name: true,
        title: true,
        profilePicture: true,
        company: true
      }
    });

    // Fix image URLs and get stats
    const similarInstructorsWithStats = await Promise.all(
      similarInstructors.map(async (instructor) => {
        try {
          const stats = await getInstructorStats(instructor.id);
          return {
            id: instructor.id,
            name: instructor.name,
            title: instructor.title,
            profilePicture: instructor.profilePicture ? 
              (instructor.profilePicture.startsWith('/') ? 
                instructor.profilePicture : 
                `/uploads/profile-pictures/${instructor.profilePicture}`) 
              : null,
            company: instructor.company,
            averageRating: stats.averageRating
          };
        } catch (error) {
          console.error(`Error processing similar instructor ${instructor.id}:`, error);
          return {
            id: instructor.id,
            name: instructor.name,
            title: instructor.title,
            profilePicture: instructor.profilePicture ? 
              (instructor.profilePicture.startsWith('/') ? 
                instructor.profilePicture : 
                `/uploads/profile-pictures/${instructor.profilePicture}`) 
              : null,
            company: instructor.company,
            averageRating: 0
          };
        }
      })
    );

    return similarInstructorsWithStats.sort((a, b) => b.averageRating - a.averageRating);

  } catch (error) {
    console.error('Error in getSimilarInstructors:', error);
    return [];
  }
};

// Get instructor's public courses - FIXED VERSION
export const getInstructorPublicCourses = async (instructorId) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: parseInt(instructorId),
        status: 'PUBLISHED'
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

    // Fix thumbnail URLs and calculate ratings
    return courses.map(course => {
      const ratings = course.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      return {
        ...course,
        thumbnail: course.thumbnail ? 
          (course.thumbnail.startsWith('/') ? 
            course.thumbnail : 
            `/uploads/course-thumbnails/${course.thumbnail}`) 
          : null,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: course.reviews.length
        // Remove reviews array to keep response clean
      };
    });
  } catch (error) {
    console.error('Error in getInstructorPublicCourses:', error);
    return [];
  }
};