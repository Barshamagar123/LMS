import prisma from "../config/prisma.js";

export const courseOwnerMiddleware = () => async (req, res, next) => {
  try {
    console.log('🔍 Course ownership check:', {
      params: req.params,
      user: req.user?.userId,
      method: req.method
    });

    // Extract course ID from various possible locations
    let courseId;
    
    // Check params first (most common)
    if (req.params.id) {
      courseId = parseInt(req.params.id);
    } else if (req.params.courseId) {
      courseId = parseInt(req.params.courseId);
    } 
    // Check body as fallback
    else if (req.body.courseId) {
      courseId = parseInt(req.body.courseId);
    }
    // Check query as last resort
    else if (req.query.courseId) {
      courseId = parseInt(req.query.courseId);
    }
    
    // Validate course ID
    if (!courseId || isNaN(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid course ID is required",
        receivedParams: req.params,
        receivedBody: req.body
      });
    }

    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Find the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        instructorId: true,
        title: true,
        status: true
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check ownership
    const instructorId = Number(course.instructorId);
    const userId = Number(req.user.userId);
    
    console.log('👥 Ownership check:', {
      courseId: course.id,
      instructorId: instructorId,
      userId: userId,
      match: instructorId === userId
    });

    if (instructorId !== userId) {
      // Optionally allow admins
      if (req.user.role === 'ADMIN') {
        console.log(`✅ Admin ${userId} accessing course ${courseId}`);
        req.course = course;
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this course"
      });
    }

    // Attach course to request for use in controller
    req.course = course;
    console.log('✅ Ownership verified for course:', course.title);
    next();

  } catch (error) {
    console.error("❌ Course ownership middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking course ownership"
    });
  }
};

// Alternative: Middleware that works with both :id and :courseId params
export const validateCourseOwnership = (paramName = 'id') => async (req, res, next) => {
  try {
    const courseId = parseInt(req.params[paramName]);
    
    if (!courseId || isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: `Valid course ID is required in parameter: ${paramName}`,
        received: req.params[paramName]
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (Number(course.instructorId) !== Number(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this course"
      });
    }

    req.courseId = courseId;
    next();
  } catch (error) {
    console.error("Ownership validation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export as default as well for backward compatibility
export default {
  courseOwnerMiddleware,
  validateCourseOwnership
};