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
  Image,
  AlertCircle,
  PlayCircle,
  CheckCircle
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
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  // Fetch user's enrollments on component mount
  useEffect(() => {
    fetchMyEnrollments();
    fetchCourses();
  }, []);

  // Fetch user's current enrollments
  const fetchMyEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const response = await API.get('/enrollments/me');
      setMyEnrollments(response.data || []);
    } catch (err) {
      console.log('Could not fetch enrollments:', err.message);
      // If not logged in or no enrollments, set empty array
      setMyEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Check if user is enrolled in a course
  const isUserEnrolled = (courseId) => {
    return myEnrollments.some(enrollment => 
      enrollment.courseId === courseId || 
      enrollment.course?.id === courseId
    );
  };

  // Get enrollment status including progress
  const getEnrollmentStatus = (courseId) => {
    const enrollment = myEnrollments.find(e => 
      e.courseId === courseId || e.course?.id === courseId
    );
    return enrollment ? {
      isEnrolled: true,
      progress: enrollment.progress || 0,
      enrollmentId: enrollment.id
    } : {
      isEnrolled: false,
      progress: 0
    };
  };

  // --- Enhanced Enrollment Handler ---
  const handleEnroll = async (courseId, e) => {
    e.stopPropagation(); 
    
    try {
      setEnrollingCourseId(courseId);
      setError('');
      setSuccess('');
      
      const course = courses.find(c => c.id === courseId);
      const isFree = (course?.price || 0) === 0;
      
      // Check if already enrolled (frontend check)
      if (isUserEnrolled(courseId)) {
        navigate(`/courses/${courseId}/learn`);
        return;
      }

      if (isFree) {
        await API.post('/enrollments/free', { courseId });
        
        // Refresh enrollments after successful enrollment
        await fetchMyEnrollments();
        
        // Update local state optimistically
        setCourses(prev => prev.map(c => 
          c.id === courseId ? { 
            ...c, 
            enrollmentsCount: (c.enrollmentsCount || 0) + 1 
          } : c
        ));
        
        // Show success message
        setSuccess('Successfully enrolled in the course!');
        
        // Navigate to learning page after enrollment
        setTimeout(() => {
          navigate(`/courses/${courseId}/learn`);
        }, 1500);
        
      } else {
        // For paid courses, go to checkout
        navigate(`/checkout/${courseId}`);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      const status = err.response?.status;

      if (status === 401) {
        navigate('/login', { 
          state: { 
            from: `/courses/${courseId}`, 
            message: 'Please login to enroll in this course' 
          } 
        });
      } else if (status === 409) {
        // Already enrolled - backend confirmed duplicate
        setError('You are already enrolled in this course');
        
        // Refresh enrollment data to update UI
        await fetchMyEnrollments();
        
        // Auto-clear error after 3 seconds
        setTimeout(() => setError(''), 3000);
      } else if (status === 400) {
        // Course is not free or other validation error
        setError(err.response?.data?.message || 'Cannot enroll in this course');
      } else {
        setError(err.response?.data?.message || 'Failed to enroll. Please try again.');
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
    navigate(`/courses/${courseId}/learn`);
  };

  // --- Helper Functions ---
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyBadge = (level) => {
    const levelLower = (level || 'beginner').toLowerCase();
    const badges = {
      'beginner': { text: 'Beginner', bg: 'bg-blue-100 text-blue-700' },
      'intermediate': { text: 'Intermediate', bg: 'bg-blue-100 text-blue-700' },
      'advanced': { text: 'Advanced', bg: 'bg-blue-100 text-blue-700' }
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
            totalMinutes += lesson.length || 0;
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
    
    const possibleFields = [
      'thumbnailUrl', 'thumbnail_url', 'image', 'imageUrl', 
      'image_url', 'coverImage', 'cover_image', 'banner'
    ];
    
    for (const field of possibleFields) {
      if (course[field] && typeof course[field] === 'string' && course[field].trim() !== '') {
        let url = course[field];
        
        if (url.startsWith('/')) {
          if (window.location.hostname === 'localhost') {
            url = `http://localhost:3000${url}`;
          } else {
            url = `${window.location.origin}${url}`;
          }
        }
        
        return url;
      }
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
      
      const response = await API.get('/courses'); 
      
      let coursesData = [];
      
      if (Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        coursesData = response.data.data;
      } else if (response.data?.courses && Array.isArray(response.data.courses)) {
        coursesData = response.data.courses;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        coursesData = response.data.results;
      }
      
      setCourses(coursesData);
      
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingEnrollments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
        <div className="ml-4 text-gray-600">Loading courses...</div>
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

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Success!</div>
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Error:</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No courses available</p>
              <button 
                onClick={fetchCourses}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : courses.map((course) => {
            const id = course.id;
            const enrollmentStatus = getEnrollmentStatus(id);
            const isEnrolled = enrollmentStatus.isEnrolled;
            const progress = enrollmentStatus.progress;
            
            const difficulty = getDifficultyBadge(course.level);
            const isFree = (course.price || 0) === 0;
            const isEnrolling = enrollingCourseId === id;
            const totalLessons = getTotalLessons(course);
            const totalDuration = getTotalCourseDuration(course);
            const thumbnailUrl = getThumbnailUrl(course);
            const imageFailed = hasImageFailed(id);

            return (
              <div key={id} className="group">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${difficulty.bg}`}>
                      {difficulty.text}
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${isFree ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
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
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={() => handleImageError(id)}
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-700 font-medium text-center text-sm">{course.title}</p>
                      </div>
                    )}
                    
                    {/* Enrollment Badge (if enrolled) */}
                    {isEnrolled && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                          ENROLLED
                        </div>
                      </div>
                    )}
                    
                    {/* Enrollment Progress Overlay (if enrolled and has progress) */}
                    {isEnrolled && progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-xs font-medium">Your Progress</span>
                          <span className="text-white text-xs font-bold">{progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-green-400 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => goToCourseDetails(id)}
                    >
                      {course.title}
                      {isEnrolled && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Enrolled</span>
                      )}
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                      {course.description || 'No description available'}
                    </p>
                    
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                          {totalLessons}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {totalDuration}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {course.enrollmentsCount || 0}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {(course.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-auto">
                      <button
                        onClick={(e) => goToCourseDetails(id, e)}
                        className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors text-sm flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>

                      {isEnrolled ? (
                        <button
                          onClick={(e) => goToLearning(id, e)}
                          className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm flex items-center justify-center"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleEnroll(id, e)}
                          disabled={isEnrolling}
                          className={`w-full py-2.5 rounded-lg font-semibold text-white transition-colors text-sm flex items-center justify-center ${
                            isEnrolling ? 'opacity-70 cursor-not-allowed' : ''
                          } ${isFree ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                        >
                          {isEnrolling ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Processing...
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
      </div>
    </div>
  );
};

export default CoursesPage;