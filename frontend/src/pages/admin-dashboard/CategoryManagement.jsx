// src/pages/admin/CategoryManagement.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [formLoading, setFormLoading] = useState(false);

  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Fetch all categories
  const fetchCategories = async () => {
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

      const res = await API.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open create modal with animation
  const handleCreate = () => {
    setModalMode("create");
    setFormData({ name: "" });
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  // Open edit modal with animation
  const handleEdit = (category) => {
    setModalMode("edit");
    setFormData({ name: category.name });
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  // Close modal with animation
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form after animation
    setTimeout(() => {
      setFormData({ name: "" });
      setCurrentCategory(null);
    }, 300);
  };

  // Handle form submission (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (modalMode === "create") {
        // Create new category
        const res = await API.post("/categories", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCategories(prev => [res.data.category, ...prev]);
        setSuccess("Category created successfully!");
      } else {
        // Update existing category
        const res = await API.patch(`/categories/${currentCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCategories(prev => prev.map(cat => 
          cat.id === currentCategory.id ? res.data.category : cat
        ));
        setSuccess("Category updated successfully!");
      }

      handleCloseModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.response?.data?.message || `Failed to ${modalMode} category`);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");

      await API.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCategories(prev => prev.filter(cat => cat.id !== id));
      setSuccess("Category deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting category:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete category";
      
      // Handle foreign key constraint error
      if (errorMsg.includes("courses") || errorMsg.includes("foreign key")) {
        setError("Cannot delete category because it is associated with existing courses. Remove all courses from this category first.");
      } else {
        setError(errorMsg);
      }
    }
  };

  // Initialize
  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading categories...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-1">Manage course categories</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchCategories}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-fadeIn">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg animate-fadeIn">
            {success}
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first category</p>
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Category</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-blue-300 bg-white group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {category.name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                          ID: {category.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2 border-t pt-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center space-x-1 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {categories.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm border inline-block">
            <span className="font-medium">Total Categories:</span> {categories.length}
          </div>
        )}
      </div>

      {/* Enhanced Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop - Lighter and more elegant */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with gradient */}
              <div className="px-6 py-4 border-b bg-linear-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {modalMode === "create" ? (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {modalMode === "create" ? "Create New Category" : "Edit Category"}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2 ml-12">
                  {modalMode === "create" 
                    ? "Add a new category to organize courses" 
                    : "Update the category details"}
                </p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Web Development, Data Science"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Category names should be unique and descriptive
                    </div>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                      disabled={formLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {formLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>{modalMode === "create" ? "Creating..." : "Updating..."}</span>
                        </>
                      ) : (
                        <>
                          {modalMode === "create" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span>{modalMode === "create" ? "Create Category" : "Update Category"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add some custom animations to your global CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CategoryManagement;