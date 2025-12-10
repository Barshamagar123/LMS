import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ 
  children, 
  role,
  requireProfileCompletion = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", {
    path: location.pathname,
    user,
    isAuthenticated: isAuthenticated(),
    role,
    requireProfileCompletion
  });

  // 1. Authentication check
  if (!isAuthenticated()) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Safety check (should not happen if isAuthenticated() returns true)
  if (!user) {
    console.log("No user object, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Role check
  if (role && user.role !== role) {
    console.log(`Role mismatch. Required: ${role}, User: ${user.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Instructor approval check
  if (user.role === "INSTRUCTOR" && !user.isApproved) {
    console.log("Instructor not approved, redirecting to pending-approval");
    return <Navigate to="/pending-approval" replace />;
  }

  // 5. Profile completion check (only for instructors)
  if (requireProfileCompletion && 
      user.role === "INSTRUCTOR" && 
      !user.profileCompleted &&
      location.pathname !== '/instructor/complete-profile') {
    console.log("Profile not completed, redirecting to complete-profile");
    console.log("User profileCompleted:", user.profileCompleted);
    return <Navigate to="/instructor/complete-profile" replace state={{ 
      from: location.pathname,
      message: "Complete your profile to access this page" 
    }} />;
  }

  console.log("ProtectedRoute: All checks passed, rendering children");
  return children;
};

export default ProtectedRoute;