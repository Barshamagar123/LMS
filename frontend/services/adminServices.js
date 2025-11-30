// src/services/adminService.js
import API from "../src/api/axios";

// Helper to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

const adminService = {
  // Fetch admin dashboard stats
  getDashboard: () => {
    return API.get("/admin/dashboard", { headers: getAuthHeader() });
  },

  // Fetch pending instructors
  getPendingInstructors: () => {
    return API.get("/admin/instructors/pending", { headers: getAuthHeader() });
  },

  // Fetch pending courses
  getPendingCourses: () => {
    return API.get("/admin/courses/pending", { headers: getAuthHeader() });
  },

  // Approve or reject an instructor
  updateInstructorStatus: (id, action) => {
    if (!["approve", "reject"].includes(action)) throw new Error("Invalid action");
    return API.patch(`/admin/instructor/${id}/${action}`, null, { headers: getAuthHeader() });
  },

  // Approve or reject a course
  updateCourseStatus: (id, action) => {
    if (!["approve", "reject"].includes(action)) throw new Error("Invalid action");
    return API.patch(`/admin/courses/${id}/${action}`, null, { headers: getAuthHeader() });
  },

  // Optional: fetch all users
  getAllUsers: () => {
    return API.get("/admin/users", { headers: getAuthHeader() });
  }
};

export default adminService;
