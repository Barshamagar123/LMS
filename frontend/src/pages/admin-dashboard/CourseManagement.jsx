import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Eye, Edit, Archive, TrendingUp, DollarSign, Users } from "lucide-react";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch categories dynamically
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 10,
        q: debouncedSearch || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
      };

      const res = await axios.get("/api/courses", { params });
      console.log("Courses fetched:", res.data);

      if (Array.isArray(res.data)) {
        setCourses(res.data);
        setTotalPages(1);
      } else if (res.data.data) {
        setCourses(res.data.data);
        setTotalPages(Math.ceil(res.data.meta.total / res.data.meta.per_page));
      } else {
        setCourses([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [page, debouncedSearch, statusFilter, categoryFilter]);

  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Course Management</h2>
          <p className="mt-1 text-sm text-gray-600">Manage all courses and their content</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          Create Course
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Loading / Empty states */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading courses...</div>
      ) : !courses.length ? (
        <div className="flex justify-center items-center h-64 text-gray-500">No courses found.</div>
      ) : (
        <>
          {/* Courses Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500">Created: {new Date(course.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.instructor?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{course.category?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(course.price)}</td>
                    <td className="px-6 py-4 flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {course.enrollmentsCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 flex items-center text-sm text-gray-900">
                      <TrendingUp className="w-4 h-4 mr-1 text-gray-400" />
                      {course.rating || "N/A"}
                    </td>
                    <td className="px-6 py-4 flex items-center text-sm text-gray-900">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                      {formatCurrency(course.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(course.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50">
                        <Edit className="w-4 h-4" />
                      </button>
                      {course.status === "published" ? (
                        <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50">
                          <Archive className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-700">Page {page} of {totalPages}</div>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-3 py-1 border rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-3 py-1 border rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseManagement;
z