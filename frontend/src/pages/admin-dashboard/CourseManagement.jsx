// src/pages/admin/CourseManagement.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      if (!isAuthenticated()) {
        setError("Please login as administrator");
        navigate("/send-otp");
        return;
      }

      if (!isAdmin()) {
        setError("Administrator access required");
        navigate("/admin-dashboard");
        return;
      }

      const token = localStorage.getItem("token");

      // Fetch all courses including those pending admin approval
      const res = await API.get("/admin/courses/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filtering
  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Update course status (approve/reject)
  const updateCourseStatus = async (courseId, status) => {
    try {
      setActionLoading(courseId);
      const token = localStorage.getItem("token");

      const endpoint =
        status === "PUBLISHED"
          ? `/admin/courses/${courseId}/approve`
          : `/admin/courses/${courseId}/reject`;

      await API.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status } : c))
      );

      setSuccess(`Course status updated to ${status}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating course status:", err);
      setError(err.response?.data?.message || "Failed to update course status");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter and search courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || c.category?.id === Number(filterCategory);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading courses...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <button
            onClick={fetchCourses}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded">{success}</div>
        )}

        {/* Courses Table */}
        <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Instructor</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Enrollments</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{course.title}</td>
                    <td className="px-4 py-2">{course.instructor?.name || "Unknown"}</td>
                    <td className="px-4 py-2 text-center">{course.status}</td>
                    <td className="px-4 py-2">{course.category?.name || "-"}</td>
                    <td className="px-4 py-2 text-center">{course.enrollmentsCount || 0}</td>
                    <td className="px-4 py-2 space-x-2 text-center">
                      {course.status !== "PUBLISHED" && (
                        <button
                          onClick={() => updateCourseStatus(course.id, "PUBLISHED")}
                          disabled={actionLoading === course.id}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                      )}
                      {course.status !== "REJECTED" && (
                        <button
                          onClick={() => updateCourseStatus(course.id, "REJECTED")}
                          disabled={actionLoading === course.id}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
 