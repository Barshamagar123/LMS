import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  BookOpen,
  Star,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  TrendingUp,
  ArrowRight,
  Calendar,
  Clock,
  User,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  LogOut,
  UserCircle,
  Menu,
  X,
  Trash2, // Added delete icon
  Loader2 // Added loader for delete state
} from 'lucide-react';
import API from '../../api/axios';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    totalRevenue: 0, 
    averageRating: 0,
    activeCourses: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  // Get current user from localStorage
  useEffect(() => {
    const getUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          return user;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
      return null;
    };
    getUser();
  }, []);

  // Fetch courses and instructor stats
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Check authentication first
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('Please login first');
        navigate('/login');
        return;
      }

      console.log('Fetching dashboard data...');
      
      // Try to fetch courses first
      const coursesRes = await API.get('/courses/instructor/me');
      console.log('Courses response:', coursesRes);
      console.log('Courses data:', coursesRes.data);
      
      // Handle different response formats
      let coursesData = [];
      if (Array.isArray(coursesRes.data)) {
        coursesData = coursesRes.data;
      } else if (coursesRes.data && Array.isArray(coursesRes.data.courses)) {
        coursesData = coursesRes.data.courses;
      } else if (coursesRes.data && coursesRes.data.data) {
        coursesData = coursesRes.data.data;
      }
      
      console.log('Processed courses:', coursesData);
      setCourses(coursesData);

      // Try to fetch stats
      try {
        const statsRes = await API.get('/courses/instructor/me/stats');
        console.log('Stats response:', statsRes);
        
        const statsData = statsRes.data || {};
        setStats({
          totalStudents: statsData.totalStudents || 0,
          totalRevenue: statsData.totalRevenue || 0,
          averageRating: statsData.averageRating || 0,
          activeCourses: coursesData.length
        });
      } catch (statsError) {
        console.warn('Could not fetch stats:', statsError);
        // Use default stats if endpoint fails
        setStats({
          totalStudents: coursesData.reduce((sum, course) => sum + (course.enrollmentsCount || 0), 0),
          totalRevenue: coursesData.reduce((sum, course) => sum + (course.revenue || 0), 0),
          averageRating: coursesData.length > 0 
            ? coursesData.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesData.length 
            : 0,
          activeCourses: coursesData.length
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        
        if (error.response.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('user');
          navigate('/login');
        } else if (error.response.status === 403) {
          setError('You do not have permission to access instructor dashboard.');
        } else if (error.response.status === 404) {
          setError('Instructor endpoint not found. Please check backend routes.');
        } else {
          setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Cannot connect to server. Please check your network connection.');
      } else {
        console.error('Request setup error:', error.message);
        setError(`Request error: ${error.message}`);
      }
      
      // Set empty courses if there's an error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle course deletion
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone. All course data including modules and lessons will be permanently deleted.`)) {
      return;
    }

    setDeletingCourseId(courseId);
    setError('');
    
    try {
      // Call DELETE endpoint
      await API.delete(`/courses/${courseId}`);
      
      // Remove the course from state
      setCourses(prev => prev.filter(course => {
        const id = course.id || course._id;
        return id !== courseId;
      }));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeCourses: prev.activeCourses - 1,
        totalStudents: prev.totalStudents - (prev.totalStudents > 0 ? 1 : 0) // Adjust student count if needed
      }));
      
      // Show success message
      setSuccess(`"${courseTitle}" has been deleted successfully.`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Course not found or already deleted.');
      } else {
        setError(error.response?.data?.message || 'Failed to delete course. Please try again.');
      }
    } finally {
      setDeletingCourseId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch(statusUpper) {
      case 'PUBLISHED':
        return { text: 'Published', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
      case 'DRAFT':
        return { text: 'Draft', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return { text: 'Pending', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'ARCHIVED':
        return { text: 'Archived', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
      default:
        return { text: status || 'Unknown', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCourseClick = (courseId) => {
    navigate(`/instructor/courses/${courseId}`);
  };

  // Updated: Now using Link instead of onClick handler
  const handleEditCourse = (courseId, e) => {
    e.stopPropagation();
    // Navigate will be handled by the Link
  };

  const handleViewCourse = (courseId, e) => {
    e.stopPropagation();
    navigate(`/courses/${courseId}`);
  };

  const filteredCourses = filterStatus === 'all' 
    ? courses 
    : courses.filter(c => {
        const courseStatus = (c.status || '').toLowerCase();
        return courseStatus === filterStatus.toLowerCase();
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Header/Navbar with Profile & Logout */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Instructor Dashboard</h1>
                  <p className="text-xs text-gray-600">Welcome back, {currentUser?.name || 'Instructor'}!</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <Link
                to="/create-course"
                className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Course
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">Instructor</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:rotate-90 transition-transform" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    to="/instructor/profile"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Link
                to="/create-course"
                className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Course</span>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Dashboard
                </button>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle className="w-5 h-5" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
              
              {/* User Info in Mobile Menu */}
              <div className="mt-4 pt-4 border-t border-gray-200 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentUser?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{currentUser?.email || 'Instructor'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
            <p className="font-medium text-yellow-800 mb-2">Debug Info:</p>
            <p>Courses count: {courses.length}</p>
            <p>Filtered count: {filteredCourses.length}</p>
            <p>Filter status: {filterStatus}</p>
            <button 
              onClick={() => {
                console.log('Courses data structure:', courses);
                console.log('First course:', courses[0]);
                console.log('First course keys:', courses[0] ? Object.keys(courses[0]) : 'No courses');
              }}
              className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
            >
              Log Courses to Console
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Across all courses</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCourses}</p>
                <p className="text-sm text-gray-500 mt-1">Total courses created</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.averageRating.toFixed(1)}
                  <span className="text-yellow-500 ml-1">★</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Student satisfaction</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600">
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Course Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Courses ({courses.length})</h2>
              <p className="text-gray-600 text-sm mt-1">Manage all your teaching content</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Courses ({courses.length})</option>
                <option value="published">Published ({courses.filter(c => (c.status || '').toUpperCase() === 'PUBLISHED').length})</option>
                <option value="draft">Draft ({courses.filter(c => (c.status || '').toUpperCase() === 'DRAFT').length})</option>
                <option value="pending_approval">Pending ({courses.filter(c => (c.status || '').toUpperCase() === 'PENDING' || c.status?.toUpperCase() === 'PENDING_APPROVAL').length})</option>
                <option value="archived">Archived ({courses.filter(c => (c.status || '').toUpperCase() === 'ARCHIVED').length})</option>
              </select>
            </div>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {courses.length === 0 ? 'No courses yet' : 'No courses match filter'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {courses.length === 0 
                  ? "You haven't created any courses yet. Start by creating your first course!"
                  : `No courses with status "${filterStatus}" found.`}
              </p>
              {courses.length === 0 && (
                <Link
                  to="/create-course"
                  className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Course
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCourses.map((course) => {
                const statusBadge = getStatusBadge(course.status);
                
                // Check for description field - it might be named differently
                const courseDescription = 
                  course.description || 
                  course.desc || 
                  course.courseDescription || 
                  course.overview || 
                  'No description available';
                
                const enrollmentCount = 
                  course.enrollmentsCount || 
                  course.enrollmentCount || 
                  course.studentsCount || 
                  course.totalStudents || 
                  0;
                
                const coursePrice = course.price || course.coursePrice || 0;
                const courseRating = course.rating || course.averageRating || 0;
                const courseTitle = course.title || course.courseTitle || 'Untitled Course';
                const courseId = course.id || course._id;

                return (
                  <div 
                    key={courseId}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => handleCourseClick(courseId)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {courseTitle}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        
                        {/* Course Description */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {courseDescription}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{enrollmentCount} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${coursePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{courseRating.toFixed(1)}</span>
                          </div>
                          {course.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {formatDate(course.createdAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* EDIT BUTTON */}
                        <Link
                          to={`/instructor/courses/${courseId}/edit`}
                          onClick={(e) => handleEditCourse(courseId, e)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit course"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        
                        {/* VIEW BUTTON */}
                        <button
                          onClick={(e) => handleViewCourse(courseId, e)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View course"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        
                        {/* DELETE BUTTON - Added delete functionality */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(courseId, courseTitle);
                          }}
                          disabled={deletingCourseId === courseId}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete course"
                        >
                          {deletingCourseId === courseId ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                        
                        {/* MORE OPTIONS */}
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="More options"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses by Status</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Published</span>
                    <span className="font-medium">{courses.filter(c => c.status === 'PUBLISHED').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600">Draft</span>
                    <span className="font-medium">{courses.filter(c => c.status === 'DRAFT').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">Pending</span>
                    <span className="font-medium">{courses.filter(c => c.status === 'PENDING' || c.status === 'PENDING_APPROVAL').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Summary</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total Revenue</span>
                    <span className="font-medium">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Price</span>
                    <span className="font-medium">
                      ${courses.length > 0 
                        ? (courses.reduce((sum, c) => sum + (c.price || 0), 0) / courses.length).toFixed(2) 
                        : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total Students</span>
                    <span className="font-medium">{stats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Rating</span>
                    <span className="font-medium">{stats.averageRating.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}