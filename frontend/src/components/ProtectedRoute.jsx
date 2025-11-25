import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" />;

  // Block unapproved instructors
  if (user.role === "INSTRUCTOR" && !user.isApproved) {
    return <Navigate to="/pending-approval" />;
  }

  return children;
};

export default ProtectedRoute;
