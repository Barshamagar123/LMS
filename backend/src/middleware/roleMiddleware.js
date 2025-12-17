// src/middleware/roleMiddleware.js

export const roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }
  const role = req.user.role?.toUpperCase();
  if (!allowedRoles.map(r => r.toUpperCase()).includes(role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};
// middleware/adminMiddleware.js
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};


export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }
  const role = req.user.role?.toUpperCase();
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};

// Shortcuts
export const isInstructor = roleMiddleware(["INSTRUCTOR"]);
export const isInstructorOrAdmin = roleMiddleware(["INSTRUCTOR", "ADMIN"]);
// Create this file if you don't have it
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Insufficient permissions. Admin access required." 
      });
    }
    
    next();
  };
};