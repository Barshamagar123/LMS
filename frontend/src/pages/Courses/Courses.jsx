import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  Eye,
  Lock,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';
import API from '../../api/axios';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [courseStats, setCourseStats] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        console.log('Auth check - Token exists:', !!token, 'User exists:', !!user);
        setIsLoggedIn(!!(token && user));
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch enrollments only if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchMyEnrollments();
    } else {
      setMyEnrollments([]);
      setCourseStats({});
    }
  }, [isLoggedIn]);

  // Enhanced fetchMyEnrollments with better error handling
  const fetchMyEnrollments = async () => {
    if (!isLoggedIn) {
      console.log('Not logged in, skipping enrollments fetch');
      return;
    }

    try {
      setLoadingEnrollments(true);
      console.log('Fetching enrollments...');
      
      const response = await API.get('/enrollments/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Enrollments API Response:', response);
      
      let enrollmentsData = [];
      
      // Handle different response structures
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          enrollmentsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          enrollmentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          enrollmentsData = response.data.data;
        }
      }
      
      console.log('Processed enrollments:', enrollmentsData.length, 'enrollments');
      
      setMyEnrollments(enrollmentsData);
      
      // Calculate and store course enrollment stats
      const stats = {};
      enrollmentsData.forEach(enrollment => {
        const courseId = enrollment.course?.id || enrollment.courseId;
        if (courseId) {
          stats[courseId] = {
            isEnrolled: true,
            progress: enrollment.progress || enrollment.stats?.progressPercentage || 0,
            enrollmentId: enrollment.id,
            status: enrollment.status || 'IN_PROGRESS'
          };
        }
      });
      setCourseStats(stats);
      
    } catch (err) {
      console.error('Fetch enrollments error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Don't show error to user for enrollments fetch
      setMyEnrollments([]);
      setCourseStats({});
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Check if user is enrolled in a course
  const isUserEnrolled = (courseId) => {
    return !!courseStats[courseId]?.isEnrolled;
  };

  // Get enrollment status including progress
  const getEnrollmentStatus = (courseId) => {
    const stats = courseStats[courseId];
    if (stats) {
      return {
        isEnrolled: true,
        progress: stats.progress || 0,
        enrollmentId: stats.enrollmentId,
        status: stats.status || 'IN_PROGRESS'
      };
    }
    
    return {
      isEnrolled: false,
      progress: 0,
      status: null
    };
  };

  // --- Enhanced Enrollment Handler ---
  const handleEnroll = async (courseId, e) => {
    if (e) e.stopPropagation();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: `/courses/${courseId}`,
          message: 'Please login to enroll in this course'
        }
      });
      return;
    }
    
    try {
      setEnrollingCourseId(courseId);
      setError('');
      setSuccess('');
      
      const course = courses.find(c => c.id === courseId);
      
      if (!course) {
        setError('Course not found');
        return;
      }
      
      const isFree = (course.price || 0) === 0;
      
      // Check if already enrolled
      if (isUserEnrolled(courseId)) {
        const enrollmentStatus = getEnrollmentStatus(courseId);
        navigate(`/courses/${courseId}/learn${enrollmentStatus.enrollmentId ? `?enrollment=${enrollmentStatus.enrollmentId}` : ''}`);
        return;
      }

      if (isFree) {
        // Call the enrollment API
        console.log('Enrolling in course:', courseId);
        const response = await API.post('/enrollments/free', { courseId }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Enrollment API Response:', response);
        
        if (response.data?.success) {
          // Refresh enrollments after successful enrollment
          await fetchMyEnrollments();
          
          // Update local course enrollment count
          setCourses(prev => prev.map(c => 
            c.id === courseId ? { 
              ...c, 
              enrollmentsCount: (c.enrollmentsCount || 0) + 1 
            } : c
          ));
          
          // Show success message
          setSuccess('Successfully enrolled in the course!');
          
          // Get the new enrollment ID
          const enrollmentData = response.data.data || response.data;
          const newEnrollmentId = enrollmentData.id || enrollmentData.enrollment?.id;
          
          // Navigate to learning page after enrollment
          setTimeout(() => {
            navigate(`/courses/${courseId}/learn${newEnrollmentId ? `?enrollment=${newEnrollmentId}` : ''}`);
          }, 1500);
          
        } else {
          setError(response.data?.message || 'Failed to enroll');
        }
        
      } else {
        // For paid courses, go to checkout
        navigate(`/checkout/${courseId}`);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      console.error('Error response:', err.response?.data);
      
      const status = err.response?.status;
      const errorData = err.response?.data;

      if (status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { 
          state: { 
            from: `/courses/${courseId}`, 
            message: 'Session expired. Please login again.' 
          } 
        });
      } else if (status === 409) {
        // Already enrolled
        setError(errorData?.message || 'You are already enrolled in this course');
        
        // Refresh enrollment data
        await fetchMyEnrollments();
        
        // Auto-clear error after 3 seconds
        setTimeout(() => setError(''), 3000);
      } else if (status === 400) {
        setError(errorData?.message || 'Cannot enroll in this course');
      } else if (status === 404) {
        setError(errorData?.message || 'Course not available for enrollment');
      } else {
        setError(errorData?.message || 'Failed to enroll. Please try again.');
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // --- Enhanced Navigation ---
  const goToCourseDetails = (courseId, e) => {
    if (e) e.stopPropagation(); 
    navigate(`/courses/${courseId}`);
  };

  const goToLearning = (courseId, e) => {
    if (e) e.stopPropagation();
    const enrollmentStatus = getEnrollmentStatus(courseId);
    navigate(`/courses/${courseId}/learn${enrollmentStatus.enrollmentId ? `?enrollment=${enrollmentStatus.enrollmentId}` : ''}`);
  };

  // --- Helper Functions ---
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyBadge = (level) => {
    if (!level) return { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' };
    
    const levelLower = level.toLowerCase();
    const badges = {
      'beginner': { text: 'Beginner', bg: 'bg-blue-100 text-blue-700' },
      'intermediate': { text: 'Intermediate', bg: 'bg-blue-100 text-blue-700' },
      'advanced': { text: 'Advanced', bg: 'bg-blue-100 text-blue-700' },
      'all_levels': { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' },
      'all': { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' }
    };
    return badges[levelLower] || { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' };
  };

  const getTotalCourseDuration = (course) => {
    if (!course.modules) return '0h';
    let totalMinutes = 0;
    if (Array.isArray(course.modules)) {
      course.modules.forEach(module => {
        if (module.lessons) {
          module.lessons.forEach(lesson => {
            totalMinutes += lesson.duration || lesson.length || 0;
          });
        }
      });
    }
    return formatDuration(totalMinutes);
  };

  const getTotalLessons = (course) => {
    if (!course.modules) return 0;
    return course.modules.reduce((total, module) => 
      total + (module.lessons?.length || 0), 0
    );
  };

  const getThumbnailUrl = (course) => {
    if (!course) return null;
    
    // Check thumbnail field
    if (course.thumbnail && typeof course.thumbnail === 'string' && course.thumbnail.trim() !== '') {
      let url = course.thumbnail;
      
      if (url.startsWith('/')) {
        if (window.location.hostname === 'localhost') {
          url = `http://localhost:3000${url}`;
        } else {
          url = `${window.location.origin}${url}`;
        }
      }
      
      return url;
    }
    
    // Check image field as fallback
    if (course.image && typeof course.image === 'string' && course.image.trim() !== '') {
      let url = course.image;
      
      if (url.startsWith('/')) {
        if (window.location.hostname === 'localhost') {
          url = `http://localhost:3000${url}`;
        } else {
          url = `${window.location.origin}${url}`;
        }
      }
      
      return url;
    }
    
    return null;
  };

  const hasImageFailed = (courseId) => {
    return failedImages.has(courseId);
  };

  const handleImageError = (courseId) => {
    setFailedImages(prev => new Set([...prev, courseId]));
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setFailedImages(new Set());
      
      console.log('Fetching courses...');
      const response = await API.get('/courses');
      
      console.log('Courses API Response:', response);
      
      let coursesData = [];
      
      // Try different response structures
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          coursesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          coursesData = response.data.data;
        } else if (response.data.courses && Array.isArray(response.data.courses)) {
          coursesData = response.data.courses;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          coursesData = response.data.results;
        }
      }
      
      console.log('Processed courses:', coursesData.length, 'courses');
      console.log('Sample course:', coursesData[0]);
      
      setCourses(coursesData);
      
    } catch (err) {
      console.error('Fetch courses error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Please login to view courses');
      } else if (err.response?.status === 404) {
        setError('Courses endpoint not found');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to load courses. Please try again.');
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate enrollment count for a course
  const getEnrollmentCount = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.enrollmentsCount || course?._count?.enrollments || 0;
  };

  // Refresh data
  const refreshData = () => {
    fetchCourses();
    if (isLoggedIn) {
      fetchMyEnrollments();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <div className="text-gray-600">Loading courses...</div>
          <div className="text-sm text-gray-400 mt-2">Please wait while we fetch the courses</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
          <p className="text-gray-600">Choose from our collection of professional courses</p>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                <strong>Courses loaded:</strong> {courses.length}
              </span>
              <span className="text-sm text-gray-600">
                <strong>Logged in:</strong> {isLoggedIn ? 'Yes' : 'No'}
              </span>
              <span className="text-sm text-gray-600">
                <strong>Enrollments:</strong> {myEnrollments.length}
              </span>
            </div>
            <button
              onClick={() => {
                console.log('Courses:', courses);
                console.log('Enrollments:', myEnrollments);
                console.log('Course Stats:', courseStats);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Debug Info
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start gap-3 animate-fade-in">
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3 animate-fade-in">
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

        {/* Authentication Status */}
        {!isLoggedIn && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Not Logged In</div>
              <div className="text-sm">Please login to enroll in courses and track your progress</div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
        )}

        {/* Refresh button */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            Showing {courses.length} courses
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Available</h3>
            <p className="text-gray-600 mb-6">There are no courses to display at the moment.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={fetchCourses}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const id = course.id;
              const enrollmentStatus = getEnrollmentStatus(id);
              const isEnrolled = enrollmentStatus.isEnrolled;
              const progress = enrollmentStatus.progress;
              const enrollmentStatusText = enrollmentStatus.status;
              
              const difficulty = getDifficultyBadge(course.level);
              const isFree = (course.price || 0) === 0;
              const isEnrolling = enrollingCourseId === id;
              const totalLessons = getTotalLessons(course);
              const totalDuration = getTotalCourseDuration(course);
              const thumbnailUrl = getThumbnailUrl(course);
              const imageFailed = hasImageFailed(id);
              const enrollmentCount = getEnrollmentCount(id);

              return (
                <div key={id} className="group animate-fade-in-up">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col hover:border-blue-200">
                    
                    {/* Difficulty Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${difficulty.bg}`}>
                        {difficulty.text}
                      </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${isFree ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                        {isFree ? 'FREE' : `$${course.price || 0}`}
                      </div>
                    </div>

                    {/* Course Image */}
                    <div 
                      className="h-48 relative overflow-hidden bg-gray-100 cursor-pointer group flex-shrink-0"
                      onClick={() => goToCourseDetails(id)}
                    >
                      {thumbnailUrl && !imageFailed ? (
                        <>
                          <img
                            src={thumbnailUrl}
                            alt={course.title || 'Course image'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => handleImageError(id)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-700 font-medium text-center text-sm">{course.title || 'Untitled Course'}</p>
                        </div>
                      )}
                      
                      {/* Enrollment Status Badge */}
                      {isEnrolled && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className={`px-2 py-1 text-xs font-semibold rounded shadow-sm ${
                            enrollmentStatusText === 'COMPLETED' 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {enrollmentStatusText === 'COMPLETED' ? 'COMPLETED' : 'ENROLLED'}
                          </div>
                        </div>
                      )}
                      
                      {/* Enrollment Progress Overlay */}
                      {isEnrolled && progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-xs font-medium">Your Progress</span>
                            <span className="text-white text-xs font-bold">{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-400 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 
                        className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                        onClick={() => goToCourseDetails(id)}
                      >
                        {course.title || 'Untitled Course'}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                        {course.description || 'No description available'}
                      </p>
                      
                      {/* Instructor Info */}
                      {course.instructor && (
                        <div className="flex items-center mb-4 text-sm text-gray-500">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 mr-2">
                            {course.instructor.name?.charAt(0) || 'I'}
                          </div>
                          <span>{course.instructor.name || 'Instructor'}</span>
                        </div>
                      )}
                      
                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center" title="Total Lessons">
                            <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                            {totalLessons}
                          </span>
                          <span className="flex items-center" title="Total Duration">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {totalDuration}
                          </span>
                          <span className="flex items-center" title="Total Enrollments">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            {enrollmentCount}
                          </span>
                        </div>
                        <span className="flex items-center" title="Course Rating">
                          <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                          {(course.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 mt-auto">
                        <button
                          onClick={(e) => goToCourseDetails(id, e)}
                          className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center border border-gray-200 hover:border-gray-300"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>

                        {isEnrolled ? (
                          <button
                            onClick={(e) => goToLearning(id, e)}
                            className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-200 text-sm flex items-center justify-center ${
                              enrollmentStatusText === 'COMPLETED'
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {enrollmentStatusText === 'COMPLETED' 
                              ? 'Review Course' 
                              : progress > 0 
                                ? 'Continue Learning' 
                                : 'Start Learning'
                            }
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleEnroll(id, e)}
                            disabled={isEnrolling || !isLoggedIn}
                            className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-200 text-sm flex items-center justify-center ${
                              isEnrolling || !isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''
                            } ${isFree ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                          >
                            {isEnrolling ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : !isLoggedIn ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Login to Enroll
                              </>
                            ) : (
                              <>
                                {isFree ? (
                                  <>
                                    <Award className="w-4 h-4 mr-2" />
                                    Enroll Free
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Enroll Now
                                  </>
                                )}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;