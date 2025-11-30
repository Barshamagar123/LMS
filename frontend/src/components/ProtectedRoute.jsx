import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" />;

  // Block unapproved instructors
  if (user.role === "INSTRUCTOR" && !user.isApproved) {
    return <Navigate to="/pending-approval" />;
  }

  return children;
};

export default ProtectedRoute;
