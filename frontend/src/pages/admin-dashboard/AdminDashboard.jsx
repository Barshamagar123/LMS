// components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import SystemSettings from './SystemSettings';

// Mock data - replace with actual API calls
const mockData = {
  stats: {
    totalUsers: 12543,
    totalCourses: 892,
    totalRevenue: 1254300,
    pendingApprovals: 23
  },
  recentActivities: [
    { id: 1, type: 'course_approval', user: 'John Doe', course: 'React Masterclass', timestamp: '2024-01-15T10:30:00Z', status: 'pending' },
    { id: 2, type: 'user_registration', user: 'Sarah Wilson', role: 'Instructor', timestamp: '2024-01-15T09:15:00Z', status: 'approved' },
    { id: 3, type: 'course_creation', user: 'Mike Chen', course: 'Advanced Python', timestamp: '2024-01-14T16:45:00Z', status: 'pending' }
  ],
  pendingApprovals: [
    { id: 1, type: 'instructor', name: 'Dr. Emily Johnson', email: 'emily@university.edu', submittedAt: '2024-01-14' },
    { id: 2, type: 'course', title: 'Machine Learning Fundamentals', instructor: 'Prof. Robert Brown', submittedAt: '2024-01-13' }
  ]
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(mockData.stats);
  const [loading, setLoading] = useState(false);

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/user-management')) return 'users';
    if (path.includes('/course-management')) return 'courses';
    if (path.includes('/analytics-management')) return 'analytics';
    if (path.includes('/setting')) return 'settings';
    return 'overview';
  };

  const handleNavigation = (tabId) => {
    switch (tabId) {
      case 'overview':
        navigate('/admin');
        break;
      case 'users':
        navigate('/user-management');
        break;
      case 'courses':
        navigate('/course-management');
        break;
      case 'analytics':
        navigate('/analytics-management');
        break;
      case 'settings':
        navigate('/setting');
        break;
      default:
        navigate('/admin');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users />}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle="+12% from last month"
          color="blue"
        />
        <StatCard
          icon={<BookOpen />}
          title="Total Courses"
          value={stats.totalCourses.toLocaleString()}
          subtitle="+8% from last month"
          color="green"
        />
        <StatCard
          icon={<DollarSign />}
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="+15% from last month"
          color="purple"
        />
        <StatCard
          icon={<TrendingUp />}
          title="Pending Approvals"
          value={stats.pendingApprovals}
          subtitle="Requires attention"
          color="orange"
        />
      </div>

      {/* Recent Activities & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockData.recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'course_approval' && `Course approval requested for "${activity.course}"`}
                        {activity.type === 'user_registration' && `New ${activity.role} registration: ${activity.user}`}
                        {activity.type === 'course_creation' && `New course created: "${activity.course}"`}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {activity.user} • {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockData.pendingApprovals.map((approval) => (
              <div key={approval.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {approval.type === 'instructor' ? `Instructor Application: ${approval.name}` : `Course: ${approval.title}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {approval.type === 'instructor' ? approval.email : `Instructor: ${approval.instructor}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted: {formatDate(approval.submittedAt)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Refresh Data
              </button>
              <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', path: '/admin' },
              { id: 'users', label: 'User Management', path: '/admin/user-management' },
              { id: 'courses', label: 'Course Management', path: '/admin/course-management' },
              { id: 'analytics', label: 'Analytics', path: '/admin/analytics-management' },
              { id: 'settings', label: 'Settings', path: '/admin/setting' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  getActiveTab() === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/course-management" element={<CourseManagement />} />
          <Route path="/analytics-management" element={<AnalyticsDashboard />} />
          <Route path="/setting" element={<SystemSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;