import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PlayCircle,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  FileText,
  Video,
  Award,
  Calendar,
  ChevronRight,
  Bookmark,
  Share2,
  AlertCircle,
  MessageCircle,
  Download,
  Globe,
  Lock,
  DollarSign,
  User,
  BarChart3,
  Target,
  Tag
} from 'lucide-react';
import API from '../../api/axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState([]);

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollment();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch course details
      const courseRes = await API.get(`/courses/${id}`);
      const courseData = courseRes.data;
      setCourse(courseData);

      // Check if modules are included or fetch separately
      if (courseData.modules && Array.isArray(courseData.modules)) {
        setModules(courseData.modules);
        // Expand first module by default
        if (courseData.modules.length > 0) {
          setExpandedModules([courseData.modules[0].id || 0]);
        }
      } else {
        // Try to fetch modules separately
        try {
          const modulesRes = await API.get(`/courses/${id}/modules`);
          setModules(modulesRes.data || []);
          if (modulesRes.data && modulesRes.data.length > 0) {
            setExpandedModules([modulesRes.data[0].id || 0]);
          }
        } catch (moduleError) {
          console.warn('Could not fetch modules:', moduleError);
        }
      }

      // Fetch instructor details
      if (courseData.instructorId) {
        try {
          const instructorRes = await API.get(`/instructors/${courseData.instructorId}`);
          setInstructor(instructorRes.data);
        } catch (instructorError) {
          console.warn('Could not fetch instructor:', instructorError);
          // Set default instructor info
          setInstructor({
            name: courseData.instructor || 'Unknown Instructor',
            bio: 'Experienced instructor in this field',
            rating: 4.8,
            students: 1000,
            courses: 5
          });
        }
      }

      // Fetch related courses
      try {
        const relatedRes = await API.get(`/courses/${id}/related`);
        setRelatedCourses(relatedRes.data || []);
      } catch (relatedError) {
        console.warn('Could not fetch related courses:', relatedError);
        // Set empty array if endpoint doesn't exist
        setRelatedCourses([]);
      }

      // Check if bookmarked
      try {
        const bookmarkRes = await API.get(`/courses/${id}/bookmark-status`);
        setIsBookmarked(bookmarkRes.data?.isBookmarked || false);
      } catch (bookmarkError) {
        // Bookmark endpoint might not exist
        console.warn('Could not check bookmark status:', bookmarkError);
      }

    } catch (error) {
      console.error('Error fetching course details:', error);
      if (error.response?.status === 404) {
        setError('Course not found. It may have been removed or is not available.');
      } else if (error.response?.status === 401) {
        setError('Please login to view course details.');
        navigate('/login', { state: { from: `/courses/${id}` } });
      } else {
        setError(error.response?.data?.message || 'Failed to load course details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = () => {
    // Check from localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const enrolledCourses = user.enrolledCourses || [];
      setIsEnrolled(enrolledCourses.includes(id));
      
      // Also check from API
      API.get(`/courses/${id}/enrollment-status`)
        .then(res => {
          if (res.data?.isEnrolled) {
            setIsEnrolled(true);
          }
        })
        .catch(err => {
          // API endpoint might not exist
          console.warn('Could not check enrollment status:', err);
        });
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const handleEnroll = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await API.post(`/courses/${id}/enroll`);
      
      setIsEnrolled(true);
      setSuccess('Successfully enrolled in the course!');
      
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.enrolledCourses) {
        user.enrolledCourses = [];
      }
      if (!user.enrolledCourses.includes(id)) {
        user.enrolledCourses.push(id);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Redirect to learning page after 2 seconds
      setTimeout(() => {
        navigate(`/learn/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      if (error.response?.status === 401) {
        setError('Please login to enroll in this course.');
        navigate('/login', { state: { from: `/courses/${id}` } });
      } else if (error.response?.status === 402) {
        setError('Payment required. This is a paid course.');
      } else {
        setError(error.response?.data?.message || 'Failed to enroll. Please try again.');
      }
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await API.delete(`/courses/${id}/bookmark`);
        setIsBookmarked(false);
        setSuccess('Removed from bookmarks');
      } else {
        await API.post(`/courses/${id}/bookmark`);
        setIsBookmarked(true);
        setSuccess('Added to bookmarks');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (error.response?.status === 401) {
        setError('Please login to bookmark courses.');
      } else {
        setError('Failed to update bookmark. Please try again.');
      }
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getContentIcon = (type) => {
    switch(type?.toUpperCase()) {
      case 'VIDEO': return <Video className="w-4 h-4 text-blue-600" />;
      case 'PDF': return <FileText className="w-4 h-4 text-red-600" />;
      case 'DOC': return <FileText className="w-4 h-4 text-green-600" />;
      case 'AUDIO': return <MessageCircle className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Course Not Found</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/courses')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-4 py-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Courses
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-blue-600 fill-blue-600' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="md:flex">
            {/* Course Thumbnail */}
            <div className="md:w-2/5">
              <div className="h-64 md:h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8">
                    <BookOpen className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">{course.title}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Course Info */}
            <div className="md:w-3/5 p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {course.category || 'General'}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level || 'All Levels'}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="font-medium text-gray-900">{course.instructor || 'Unknown Instructor'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-medium text-gray-900">
                      {course.rating?.toFixed(1) || '4.5'} ({course.reviewsCount || 0} reviews)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="font-medium text-gray-900">
                      {course.students?.toLocaleString() || '0'} enrolled
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isEnrolled ? (
                  <Link
                    to={`/learn/${id}`}
                    className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
                  >
                    <PlayCircle className="w-6 h-6" />
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="flex-1 flex items-center justify-center gap-3 bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
                  >
                    {course.price === 0 ? (
                      <>
                        <BookOpen className="w-6 h-6" />
                        Enroll for Free
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6" />
                        Enroll Now - ${course.price}
                      </>
                    )}
                  </button>
                )}
                
                <button className="px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold">
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="md:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {['overview', 'curriculum', 'instructor', 'reviews', 'faq'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {['Master key concepts', 'Build real projects', 'Get certified', 'Join community'].map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Description</h3>
                      <div className="text-gray-700 space-y-4">
                        <p>{course.description || 'No detailed description available.'}</p>
                        <p>This comprehensive course will take you from beginner to advanced level with hands-on projects and real-world examples.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>Basic computer skills</li>
                        <li>Internet connection</li>
                        <li>No prior experience needed</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Course Content</h3>
                        <p className="text-gray-600">{modules.length} modules • {modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)} lessons</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">
                          {formatDuration(course.duration || modules.reduce((total, module) => total + (module.duration || 0), 0))}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {modules.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">No curriculum available yet</p>
                        </div>
                      ) : (
                        modules.map((module, index) => (
                          <div key={module.id || index} className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggleModule(module.id || index)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">{index + 1}</span>
                                </div>
                                <div className="text-left">
                                  <h4 className="font-semibold text-gray-900">{module.title || `Module ${index + 1}`}</h4>
                                  <p className="text-sm text-gray-600">
                                    {module.lessons?.length || 0} lessons • {formatDuration(module.duration || 0)}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedModules.includes(module.id || index) ? 'rotate-90' : ''
                              }`} />
                            </button>
                            
                            {expandedModules.includes(module.id || index) && module.lessons && (
                              <div className="p-4 border-t border-gray-200 bg-white">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div key={lesson.id || lessonIndex} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                                      <span className="text-xs text-gray-600">{lessonIndex + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-medium text-gray-900">{lesson.title || `Lesson ${lessonIndex + 1}`}</h5>
                                        {lesson.duration && (
                                          <span className="text-sm text-gray-500">{formatDuration(lesson.duration)}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getContentIcon(lesson.contentType)}
                                        <span className="text-xs text-gray-500">
                                          {lesson.contentType || 'Content'}
                                        </span>
                                      </div>
                                    </div>
                                    {isEnrolled ? (
                                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <PlayCircle className="w-5 h-5" />
                                      </button>
                                    ) : (
                                      <Lock className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && instructor && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {instructor.name?.charAt(0) || 'I'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{instructor.name}</h3>
                        <p className="text-gray-600 mb-4">{instructor.title || 'Professional Instructor'}</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{instructor.rating?.toFixed(1) || '4.8'} Instructor Rating</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{instructor.courses || 5} Courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{instructor.students?.toLocaleString() || '1,000'} Students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">About the Instructor</h4>
                      <p className="text-gray-700">
                        {instructor.bio || 'Experienced professional with years of teaching experience. Passionate about sharing knowledge and helping students succeed.'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Other Courses by {instructor.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedCourses.slice(0, 2).map((relatedCourse) => (
                          <Link
                            key={relatedCourse.id}
                            to={`/courses/${relatedCourse.id}`}
                            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">{relatedCourse.title}</h5>
                                <p className="text-sm text-gray-600">
                                  {relatedCourse.students?.toLocaleString() || 0} students • {formatDuration(relatedCourse.duration || 0)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews (Placeholder) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Student Reviews</h3>
              <div className="space-y-6">
                {/* Sample reviews - in real app, fetch from API */}
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Student {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">2 weeks ago</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Great course! The instructor explains complex concepts in an easy-to-understand way.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Course Features */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Course Includes</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{formatDuration(course.duration || 0)} of video content</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)} downloadable resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-700">Certificate of completion</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700">Access on mobile and TV</span>
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Satisfaction Rate</span>
                    <span>96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{course.students?.toLocaleString() || '0'}</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{course.rating?.toFixed(1) || '4.5'}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Course */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this course</h3>
              <div className="flex gap-3">
                {['facebook', 'twitter', 'linkedin', 'whatsapp'].map((platform) => (
                  <button
                    key={platform}
                    className="flex-1 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <span className="font-medium text-gray-700 capitalize">{platform}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {relatedCourses.slice(0, 3).map((relatedCourse) => (
                    <Link
                      key={relatedCourse.id}
                      to={`/courses/${relatedCourse.id}`}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{relatedCourse.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{relatedCourse.instructor}</span>
                          <span>•</span>
                          <span>{relatedCourse.price === 0 ? 'Free' : `$${relatedCourse.price}`}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;