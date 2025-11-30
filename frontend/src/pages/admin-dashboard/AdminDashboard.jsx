import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

// Import your components
import AnalyticsDashboard from "./AnalyticsDashboard";
import CourseManagement from "./CourseManagement";
import SystemSettings from "./SystemSettings";
import UserManagement from "./UserManagement";

// Dashboard Card Component
const StatCard = ({ title, value, icon, onClick }) => (
  <div 
    className={`bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className="text-4xl text-blue-500">{icon}</div>
    <div>
      <h4 className="text-gray-500">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

// Navigation Sidebar Component
const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'courses', label: 'Course Management', icon: '📚' },
    { id: 'settings', label: 'System Settings', icon: '⚙️' },
  ];

  return (
    <div className="bg-white shadow-lg h-full w-64 p-4">
      <h2 className="text-xl font-bold mb-8 text-gray-800">Admin Panel</h2>
      <nav>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
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
const AdminNavbar = ({ activeTab, user, onLogout }) => {
  const getPageTitle = (tab) => {
    const titles = {
      dashboard: 'Dashboard Overview',
      analytics: 'Analytics Dashboard',
      users: 'User Management',
      courses: 'Course Management',
      settings: 'System Settings'
    };
    return titles[tab] || 'Admin Panel';
  };

  return (
    <div className="bg-white shadow-md border-b">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-800">
            {getPageTitle(activeTab)}
          </h1>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-600 capitalize">
            {activeTab === 'dashboard' ? 'Overview' : activeTab}
          </span>
        </div>

        {/* Right side - User info & actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Messages */}
          <button className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>

          {/* User profile dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
              </div>
              <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </a>
              <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </a>
              <div className="border-t my-1"></div>
              <button 
                onClick={onLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ 
  stats, 
  pendingInstructors, 
  pendingCourses, 
  onNavigate,
  handleInstructorApproval,
  handleCourseApproval 
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Stats - Now clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon="👥" 
          onClick={() => onNavigate('users')}
        />
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon="📚" 
          onClick={() => onNavigate('courses')}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue}`} 
          icon="💰" 
          onClick={() => onNavigate('analytics')}
        />
      </div>

      {/* Two Column Layout for Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Instructors Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Pending Instructor Approvals</h3>
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {pendingInstructors.length} pending
            </span>
          </div>
          {pendingInstructors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending instructor applications.</p>
          ) : (
            <div className="space-y-3">
              {pendingInstructors.map(inst => (
                <div key={inst.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{inst.name}</p>
                    <p className="text-sm text-gray-500">{inst.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Applied: {new Date(inst.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleInstructorApproval(inst.id, true)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleInstructorApproval(inst.id, false)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Courses Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Pending Course Approvals</h3>
            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {pendingCourses.length} pending
            </span>
          </div>
          {pendingCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending course submissions.</p>
          ) : (
            <div className="space-y-3">
              {pendingCourses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 truncate">{course.title}</p>
                    <p className="text-sm text-gray-500">By: {course.instructor?.name || "Unknown"}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        course.price === 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCourseApproval(course.id, true)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleCourseApproval(course.id, false)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">New user registration</p>
              <p className="text-xs text-gray-500">John Doe registered as a student</p>
            </div>
            <span className="text-xs text-gray-400">2 min ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">Course approved</p>
              <p className="text-xs text-gray-500">"React Fundamentals" was published</p>
            </div>
            <span className="text-xs text-gray-400">1 hour ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">Payment received</p>
              <p className="text-xs text-gray-500">$49.99 for "Advanced JavaScript"</p>
            </div>
            <span className="text-xs text-gray-400">3 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
  });
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator"
  });
  const navigate = useNavigate();

  // Fetch user data
  const fetchUserData = async () => {
    try {
      // Replace with your actual user endpoint
      const userRes = await API.get("/admin/me");
      setUser(userRes.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Fallback to default user data
      setUser({
        name: "Admin User",
        email: "admin@example.com",
        role: "Administrator"
      });
    }
  };

  // Fetch dashboard stats
  const fetchDashboard = async () => {
    try {
      const statsRes = await API.get("/admin/dashboard");
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  // Fetch pending instructors
  const fetchPendingInstructors = async () => {
    try {
      const res = await API.get("/admin/instructors/pending");
      setPendingInstructors(res.data);
    } catch (err) {
      console.error("Error fetching pending instructors:", err);
    }
  };

  // Fetch pending courses
  const fetchPendingCourses = async () => {
    try {
      const res = await API.get("/admin/courses/pending");
      setPendingCourses(res.data);
    } catch (err) {
      console.error("Error fetching pending courses:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboard(), 
        fetchPendingInstructors(), 
        fetchPendingCourses(),
        fetchUserData()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/send-otp');
  };

  const handleInstructorApproval = async (userId, approve = true) => {
    try {
      const endpoint = approve
        ? `/admin/instructor/${userId}/approve`
        : `/admin/instructor/${userId}/reject`;
      await API.patch(endpoint);
      setPendingInstructors(prev => prev.filter(u => u.id !== userId));
      // Refresh stats after approval
      fetchDashboard();
    } catch (err) {
      console.error("Error updating instructor status:", err);
    }
  };

  const handleCourseApproval = async (courseId, approve = true) => {
    try {
      const endpoint = approve
        ? `/admin/courses/${courseId}/approve`
        : `/admin/courses/${courseId}/reject`;
      await API.patch(endpoint);
      setPendingCourses(prev => prev.filter(c => c.id !== courseId));
      // Refresh stats after approval
      fetchDashboard();
    } catch (err) {
      console.error("Error updating course status:", err);
    }
  };

  // Handle navigation to different pages
  const handleNavigate = (page) => {
    navigate(`/admin/${page}`);
    setActiveTab(page);
  };

  // Render different components based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardContent 
            stats={stats}
            pendingInstructors={pendingInstructors}
            pendingCourses={pendingCourses}
            onNavigate={handleNavigate}
            handleInstructorApproval={handleInstructorApproval}
            handleCourseApproval={handleCourseApproval}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return (
          <DashboardContent 
            stats={stats}
            pendingInstructors={pendingInstructors}
            pendingCourses={pendingCourses}
            onNavigate={handleNavigate}
            handleInstructorApproval={handleInstructorApproval}
            handleCourseApproval={handleCourseApproval}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <AdminNavbar 
          activeTab={activeTab} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;