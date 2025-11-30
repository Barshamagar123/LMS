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
  RefreshCw
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
  const [filterStatus, setFilterStatus] = useState('all');

  // Debug function to check authentication
  const checkAuthentication = () => {
    const storedUser = localStorage.getItem('user');
    console.log('Stored user:', storedUser);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Parsed user:', user);
        console.log('Token exists:', !!user.token);
        return user.token;
      } catch (err) {
        console.error('Error parsing user data:', err);
        return null;
      }
    }
    return null;
  };

  // Fetch courses and instructor stats
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check authentication first
      const token = checkAuthentication();
      if (!token) {
        setError('Please login first');
        localStorage.removeItem('user');
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

  const handleCourseClick = (courseId) => {
    navigate(`/instructor/courses/${courseId}`);
  };

  const handleEditCourse = (courseId, e) => {
    e.stopPropagation();
    navigate(`/instructor/courses/${courseId}/edit`);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your courses and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link
              to="/create-course"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Course
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
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

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
            <p className="font-medium text-yellow-800 mb-2">Debug Info:</p>
            <p>Courses count: {courses.length}</p>
            <p>Filtered count: {filteredCourses.length}</p>
            <p>Filter status: {filterStatus}</p>
            <button 
              onClick={() => console.log('Courses:', courses)}
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
                <p className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</p>
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
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
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
                return (
                  <div 
                    key={course.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {course.title || 'Untitled Course'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color} ${statusBadge.border}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {course.description || 'No description provided'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{course.enrollmentsCount || 0} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${(course.price || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{course.rating?.toFixed(1) || '0.0'}</span>
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
                        <button
                          onClick={(e) => handleEditCourse(course.id, e)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit course"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => handleViewCourse(course.id, e)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View course"
                        >
                          <Eye className="w-5 h-5" />
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
      </div>
    </div>
  );
}