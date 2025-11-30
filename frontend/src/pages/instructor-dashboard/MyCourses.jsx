import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

// Dashboard Card Component
const StatCard = ({ title, value, icon, subtitle, color = "blue", onClick }) => (
  <div 
    className={`bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 border-l-4 border-${color}-500 hover:shadow-xl transition-all duration-300 ${
      onClick ? 'cursor-pointer transform hover:scale-105' : ''
    }`}
    onClick={onClick}
  >
    <div className={`text-3xl text-${color}-500 bg-${color}-50 p-3 rounded-lg`}>
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-gray-600 text-sm font-medium uppercase tracking-wide">{title}</h4>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

// Course Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    DRAFT: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
    PUBLISHED: { color: "bg-green-100 text-green-800", label: "Published" },
    ARCHIVED: { color: "bg-gray-100 text-gray-800", label: "Archived" }
  };

  const config = statusConfig[status] || statusConfig.DRAFT;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Navigation Sidebar Component
const InstructorSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'students', label: 'Students', icon: '👥' },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-900 to-purple-900 text-white w-64 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Instructor Portal</h2>
        <p className="text-blue-200 text-sm mt-1">Manage your courses</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-white text-blue-900 shadow-lg' 
                : 'text-blue-100 hover:bg-blue-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// Navbar Component
const InstructorNavbar = ({ user, onLogout }) => {
  return (
    <div className="bg-white shadow-lg border-b">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
            </svg>
          </button>

          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'I'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Instructor'}</p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Creation Modal
const CourseCreationModal = ({ isOpen, onClose, onCreateCourse, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    categoryId: '',
    isFree: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateCourse(formData);
    onClose();
    setFormData({ title: '', description: '', price: 0, categoryId: '', isFree: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
          <p className="text-gray-600 mt-1">Start building your next great course</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Describe what students will learn"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.isFree}
                    onChange={() => setFormData({ ...formData, isFree: true, price: 0 })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Free Course</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!formData.isFree}
                    onChange={() => setFormData({ ...formData, isFree: false })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Paid Course</span>
                </label>
                {!formData.isFree && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Course Management Table
const CourseManagementTable = ({ courses, onEditCourse, onManageContent, onUpdateStatus }) => {
  const getStatusActions = (status) => {
    switch (status) {
      case 'DRAFT':
        return [{ label: 'Publish', action: 'PUBLISHED', color: 'green' }];
      case 'PUBLISHED':
        return [
          { label: 'Unpublish', action: 'DRAFT', color: 'yellow' },
          { label: 'Archive', action: 'ARCHIVED', color: 'gray' }
        ];
      case 'ARCHIVED':
        return [{ label: 'Restore', action: 'DRAFT', color: 'blue' }];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Course Management</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">${course.price === 0 ? 'Free' : course.price}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={course.status} />
                </td>
                <td className="px-6 py-4 text-gray-900">{course.enrollmentsCount}</td>
                <td className="px-6 py-4 text-gray-900">${course.revenue}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="ml-1 text-gray-900">{course.rating || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onManageContent(course)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Content
                    </button>
                    <button
                      onClick={() => onEditCourse(course)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {getStatusActions(course.status).map(action => (
                      <button
                        key={action.action}
                        onClick={() => onUpdateStatus(course.id, action.action)}
                        className={`text-${action.color}-600 hover:text-${action.color}-800 text-sm font-medium`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Student Progress Overview
const StudentProgressOverview = ({ courses }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Progress</h3>
      <div className="space-y-6">
        {courses.slice(0, 3).map(course => (
          <div key={course.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">{course.title}</h4>
              <span className="text-sm text-gray-500">{course.enrollmentsCount} students</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Progress</span>
                <span className="font-medium text-gray-900">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ stats, courses, onCreateCourse, onManageContent }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon="👥" 
          color="blue"
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue}`} 
          icon="💰" 
          subtitle="Lifetime earnings"
          color="green"
        />
        <StatCard 
          title="Average Rating" 
          value={stats.averageRating} 
          icon="⭐" 
          subtitle="Based on reviews"
          color="yellow"
        />
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={onCreateCourse}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>Create New Course</span>
        </button>
      </div>

      {/* Course Management */}
      <CourseManagementTable 
        courses={courses} 
        onManageContent={onManageContent}
      />

      {/* Student Progress */}
      <StudentProgressOverview courses={courses} />
    </div>
  );
};

// Main Instructor Dashboard Component
const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user] = useState({
    name: "Instructor Name",
    email: "instructor@example.com"
  });
  const navigate = useNavigate();

  // Fetch instructor data
  const fetchInstructorData = async () => {
    try {
      const [coursesRes, statsRes, categoriesRes] = await Promise.all([
        API.get("/courses/instructor/me"),
        API.get("/courses/instructor/me/stats"),
        API.get("/categories")
      ]);
      
      setCourses(coursesRes.data);
      setStats(statsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching instructor data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const handleCreateCourse = async (courseData) => {
    try {
      const response = await API.post("/courses", courseData);
      setCourses(prev => [response.data, ...prev]);
      // Refresh stats to include new course
      const statsRes = await API.get("/courses/instructor/me/stats");
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleUpdateCourseStatus = async (courseId, newStatus) => {
    try {
      await API.patch(`/courses/${courseId}`, { status: newStatus });
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, status: newStatus } : course
      ));
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };

  const handleManageContent = (course) => {
    navigate(`/instructor/courses/${course.id}/content`);
  };

  const handleEditCourse = (course) => {
    // Navigate to course edit page or open edit modal
    console.log("Edit course:", course);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <InstructorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <InstructorNavbar user={user} />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <DashboardContent 
            stats={stats}
            courses={courses}
            onCreateCourse={() => setShowCreateModal(true)}
            onManageContent={handleManageContent}
          />
        </div>
      </div>

      {/* Course Creation Modal */}
      <CourseCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCourse={handleCreateCourse}
        categories={categories}
      />
    </div>
  );
};

export default InstructorDashboard;