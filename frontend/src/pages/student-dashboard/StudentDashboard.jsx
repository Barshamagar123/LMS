import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarDays,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Target,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  PlayCircle,
  Star,
  Eye,
  Zap,
  Trophy,
  Flame,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  X
} from 'lucide-react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchCourse, setSearchCourse] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Data from backend APIs
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLearningHours: 0,
    averageRating: 0,
    streakDays: 0,
    achievementCount: 0,
    completionRate: 0,
    averageProgress: 0
  });
  
  const [enrollments, setEnrollments] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Check authentication
  const isLoggedIn = !!localStorage.getItem('token');

  // Fetch all dashboard data
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { 
          from: '/dashboard', 
          message: 'Please login to access your dashboard' 
        } 
      });
      return;
    }
    
    fetchDashboardData();
  }, [isLoggedIn, navigate]);

  // Fetch dashboard data from your backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch user stats (from your userController - GET /api/users/me/stats)
      const statsResponse = await API.get('/users/me/stats', { headers });
      if (statsResponse.data?.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch user enrollments (from your enrollmentController - GET /api/enrollments/me)
      const enrollmentsResponse = await API.get('/enrollments/me', { headers });
      if (enrollmentsResponse.data?.success) {
        setEnrollments(enrollmentsResponse.data.data || []);
      }

      // Fetch recommended courses (from your courseController - GET /api/courses/recommended)
      const recommendedResponse = await API.get('/courses/recommended?limit=6', { headers });
      if (recommendedResponse.data?.success) {
        setRecommendedCourses(recommendedResponse.data.data || []);
      }

      // Fetch upcoming deadlines (mock - create this endpoint based on your Deadline model)
      // For now, we'll extract from enrollments
      const mockDeadlines = generateDeadlinesFromEnrollments(enrollmentsResponse.data?.data || []);
      setDeadlines(mockDeadlines);

      // Fetch achievements (mock - create this endpoint based on your Achievement model)
      const mockAchievements = generateMockAchievements(statsResponse.data?.data || {});
      setAchievements(mockAchievements);

      // Generate recent activity from enrollments
      const activity = generateRecentActivity(enrollmentsResponse.data?.data || []);
      setRecentActivity(activity);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { 
          state: { 
            from: '/dashboard', 
            message: 'Session expired. Please login again.' 
          } 
        });
      } else {
        setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate deadlines from enrollments (mock until you create the endpoint)
  const generateDeadlinesFromEnrollments = (enrollmentsData) => {
    const deadlines = [];
    
    enrollmentsData.slice(0, 3).forEach((enrollment, index) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (index + 3)); // 3, 4, 5 days from now
      
      deadlines.push({
        id: index + 1,
        title: `Assignment ${index + 1}`,
        description: `Complete the assignment for ${enrollment.course?.title || 'Course'}`,
        dueDate: dueDate.toISOString(),
        courseId: enrollment.course?.id,
        courseTitle: enrollment.course?.title || 'Course',
        assignmentId: `ASSIGN${index + 1}`,
        isCompleted: false,
        priority: index === 0 ? 'HIGH' : index === 1 ? 'MEDIUM' : 'LOW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    
    return deadlines;
  };

  // Generate mock achievements (create /api/achievements endpoint based on your Achievement model)
  const generateMockAchievements = (statsData) => {
    const achievements = [
      {
        id: 1,
        name: 'First Course Completed',
        description: 'Successfully completed your first course',
        icon: '🎓',
        type: 'COMPLETION',
        criteria: 'Complete 1 course',
        earnedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        certificateUrl: null
      },
      {
        id: 2,
        name: 'Learning Streak',
        description: 'Learned for 3 consecutive days',
        icon: '🔥',
        type: 'STREAK',
        criteria: 'Learn for 3 days in a row',
        earnedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        certificateUrl: null
      },
      {
        id: 3,
        name: 'Course Explorer',
        description: 'Enrolled in 3 courses',
        icon: '📚',
        type: 'ENROLLMENT',
        criteria: 'Enroll in 3 courses',
        earnedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        certificateUrl: null
      }
    ];
    
    if (statsData.completedCourses >= 1) {
      achievements.push({
        id: 4,
        name: 'Quick Learner',
        description: 'Completed a course in less than a week',
        icon: '⚡',
        type: 'PERFORMANCE',
        criteria: 'Complete course quickly',
        earnedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        certificateUrl: null
      });
    }
    
    return achievements;
  };

  // Generate recent activity from enrollments
  const generateRecentActivity = (enrollmentsData) => {
    const activities = [];
    
    enrollmentsData.slice(0, 5).forEach((enrollment) => {
      const course = enrollment.course;
      const progress = enrollment.progress || 0;
      
      if (progress > 0) {
        activities.push({
          id: `activity-${enrollment.id}`,
          type: 'progress',
          title: course?.title || 'Course',
          description: `Progress updated to ${progress}%`,
          time: enrollment.updatedAt || enrollment.createdAt,
          icon: '📈'
        });
      }
      
      activities.push({
        id: `enroll-${enrollment.id}`,
        type: 'enrollment',
        title: course?.title || 'Course',
        description: 'Enrolled in course',
        time: enrollment.createdAt,
        icon: '🎯'
      });
    });
    
    // Sort by time (newest first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return activities.slice(0, 5);
  };

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await API.post('/enrollments/free', 
        { courseId }, 
        { headers }
      );

      if (response.data?.success) {
        setSuccess('Successfully enrolled in the course!');
        // Refresh enrollments
        const enrollmentsResponse = await API.get('/enrollments/me', { headers });
        if (enrollmentsResponse.data?.success) {
          setEnrollments(enrollmentsResponse.data.data || []);
        }
        
        // Navigate to learning page after 1.5 seconds
        setTimeout(() => {
          navigate(`/courses/${courseId}/learn`);
        }, 1500);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      if (err.response?.status === 409) {
        setError('You are already enrolled in this course');
      } else {
        setError(err.response?.data?.message || 'Failed to enroll. Please try again.');
      }
    }
  };

  // Filter courses for display
  const filteredCourses = () => {
    let filtered = enrollments.map(e => ({
      ...e.course,
      enrollmentId: e.id,
      progress: e.progress || e.stats?.progressPercentage || 0,
      status: e.status || 'IN_PROGRESS',
      lastAccessed: e.updatedAt || e.lastAccessed,
      completedLessons: e.completedLessons || 0,
      totalLessons: e.totalLessons || 0,
      duration: e.duration || 0
    }));
    
    if (showCompleted) {
      filtered = filtered.filter(course => 
        course.progress === 100 || 
        (enrollments.find(e => e.courseId === course.id)?.status === 'COMPLETED')
      );
    } else {
      filtered = filtered.filter(course => 
        course.progress < 100 && 
        (enrollments.find(e => e.courseId === course.id)?.status !== 'COMPLETED')
      );
    }
    
    if (searchCourse) {
      const query = searchCourse.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        (course.description || '').toLowerCase().includes(query) ||
        (course.category?.name || '').toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Calculate days until deadline
  const daysUntilDeadline = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const courses = filteredCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
              <p className="text-blue-100">
                Welcome back! Track your learning progress and achievements.
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-orange-300 mr-1" />
                  <span className="text-sm font-medium">
                    {stats.streakDays || 0} day streak
                  </span>
                </div>
                <div className="text-sm text-blue-100">
                  Last updated: {formatDate(new Date())}
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <button
                onClick={fetchDashboardData}
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Refresh Dashboard
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stats Card 1 - Enrolled Courses */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="text-sm text-green-600">
                  +{stats.inProgressCourses || 0} in progress
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.enrolledCourses || 0}</h3>
                <p className="text-gray-600">Enrolled Courses</p>
              </div>
            </div>

            {/* Stats Card 2 - Completion Rate */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <Target className="h-6 w-6" />
                </div>
                <div className="text-sm text-green-600">
                  {stats.completedCourses || 0} completed
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.completionRate || stats.averageProgress || 0}%</h3>
                <p className="text-gray-600">Completion Rate</p>
              </div>
            </div>

            {/* Stats Card 3 - Learning Hours */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-sm text-green-600">
                  +2h this week
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalLearningHours || 0}</h3>
                <p className="text-gray-600">Learning Hours</p>
              </div>
            </div>

            {/* Stats Card 4 - Achievements */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                  <Award className="h-6 w-6" />
                </div>
                <div className="text-sm text-green-600">
                  Keep learning!
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.achievementCount || achievements.length}</h3>
                <p className="text-gray-600">Achievements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Error:</div>
              <div>{error}</div>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Success!</div>
              <div>{success}</div>
            </div>
            <button 
              onClick={() => setSuccess('')}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                  Learning Progress
                </h2>
                <div className="flex space-x-2">
                  {['overview', 'in-progress', 'completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="mb-8">
                <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stats.averageProgress || 0}%
                    </div>
                    <p className="text-gray-600">Average Course Progress</p>
                    <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-600">{stats.completedCourses || 0} Completed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-gray-600">{stats.inProgressCourses || 0} In Progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'overview' && 'My Courses'}
                    {activeTab === 'in-progress' && 'Courses in Progress'}
                    {activeTab === 'completed' && 'Completed Courses'}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchCourse}
                        onChange={(e) => setSearchCourse(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className={`px-3 py-2 text-sm rounded-lg border ${
                        showCompleted
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {showCompleted ? 'Show All' : 'Show Completed'}
                    </button>
                  </div>
                </div>
                
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchCourse ? 'No courses found' : 'No courses yet'}
                    </h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchCourse 
                        ? 'Try different search terms or clear the search filter.'
                        : showCompleted
                        ? "You haven't completed any courses yet. Keep learning!"
                        : "You're not enrolled in any courses yet. Start learning!"}
                    </p>
                    <button
                      onClick={() => navigate('/courses')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  courses.slice(0, 5).map((course, index) => {
                    const enrollment = enrollments.find(e => e.courseId === course.id) || {};
                    const progress = enrollment.progress || enrollment.stats?.progressPercentage || 0;
                    const isCompleted = progress === 100 || enrollment.status === 'COMPLETED';

                    return (
                      <div
                        key={`course-${course.id}-${index}`}
                        className="group bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-blue-300 cursor-pointer"
                        onClick={() => {
                          if (course.id && enrollment.id) {
                            navigate(`/courses/${course.id}/learn?enrollment=${enrollment.id}`);
                          } else if (course.id) {
                            navigate(`/courses/${course.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            {isCompleted && (
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {course.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {course.category && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    {course.category.name || 'General'}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatDate(enrollment.updatedAt)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {course.description || 'No description available'}
                            </p>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  {enrollment.totalLessons || course.totalLessons || 'N/A'} lessons
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {enrollment.duration || course.duration || 'N/A'} min
                                </span>
                                <span className="flex items-center">
                                  <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                                  {(course.rating || 0).toFixed(1)}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <div className="w-32">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span className="font-semibold">{progress}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (course.id && enrollment.id) {
                                      navigate(`/courses/${course.id}/learn?enrollment=${enrollment.id}`);
                                    } else if (course.id) {
                                      navigate(`/courses/${course.id}`);
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                                >
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  {progress > 0 ? 'Continue' : 'Start'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {courses.length > 5 && (
                  <div className="text-center pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/my-courses')}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
                    >
                      View All Courses
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                    Recommended For You
                  </h2>
                  <button 
                    onClick={() => navigate('/courses?filter=recommended')}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedCourses.slice(0, 3).map((course) => {
                    const isAlreadyEnrolled = enrollments.some(e => e.courseId === course.id);

                    return (
                      <div key={`recommended-${course.id}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 relative">
                          {course.thumbnail && (
                            <img 
                              src={course.thumbnail.startsWith('http') ? course.thumbnail : `/${course.thumbnail}`}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {course.price === 0 && (
                            <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                              FREE
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 text-xs mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              <span>{course.enrollmentCount || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                              <span>{(course.rating || 0).toFixed(1)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (isAlreadyEnrolled) {
                                const enrollment = enrollments.find(e => e.courseId === course.id);
                                navigate(`/courses/${course.id}/learn?enrollment=${enrollment?.id}`);
                              } else if (course.price === 0) {
                                handleEnroll(course.id);
                              } else {
                                navigate(`/courses/${course.id}`);
                              }
                            }}
                            className={`w-full py-2 rounded-lg font-semibold text-white text-sm ${
                              isAlreadyEnrolled 
                                ? 'bg-gradient-to-r from-green-600 to-green-700'
                                : course.price === 0
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                                : 'bg-gradient-to-r from-gray-800 to-gray-900'
                            }`}
                          >
                            {isAlreadyEnrolled ? 'Continue Learning' : course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-red-600" />
                  Upcoming Deadlines
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {deadlines.length} items
                </span>
              </div>

              <div className="space-y-4">
                {deadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No upcoming deadlines</p>
                    <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  deadlines.map((deadline) => {
                    const daysLeft = daysUntilDeadline(deadline.dueDate);
                    const isOverdue = daysLeft < 0;
                    const isToday = daysLeft === 0;

                    return (
                      <div key={`deadline-${deadline.id}`} className="p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              deadline.isCompleted 
                                ? 'bg-green-100' 
                                : isOverdue 
                                ? 'bg-red-100'
                                : 'bg-blue-100'
                            }`}>
                              {deadline.isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : isOverdue ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <Calendar className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                              <p className="text-sm text-gray-600">{deadline.courseTitle}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-gray-600">
                            Due: {formatDate(deadline.dueDate)}
                          </div>
                          <div className={`font-medium ${
                            deadline.isCompleted 
                              ? 'text-green-600'
                              : isOverdue 
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}>
                            {deadline.isCompleted 
                              ? 'Completed' 
                              : isOverdue 
                              ? `${Math.abs(daysLeft)} days overdue`
                              : isToday 
                              ? 'Due today'
                              : `${daysLeft} days left`
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Trophy className="h-6 w-6 mr-2 text-yellow-600" />
                  Recent Achievements
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {achievements.length} earned
                </span>
              </div>

              <div className="space-y-4">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={`achievement-${achievement.id}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                      <Award className="h-6 w-6 text-yellow-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{achievement.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Earned {formatDate(achievement.earnedDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Zap className="h-6 w-6 mr-2 text-orange-600" />
                  Recent Activity
                </h2>
                <CalendarDays className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg">
                        <Zap className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(activity.time)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
