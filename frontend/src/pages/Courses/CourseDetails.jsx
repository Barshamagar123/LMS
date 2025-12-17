import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Bookmark,
  Share2,
  AlertCircle,
  Download,
  Globe,
  Lock,
  User,
  BarChart,
  Tag,
  Calendar,
  ThumbsUp,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
  FileVideo,
  Headphones,
  Briefcase,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Heart,
  Image as ImageIcon
} from 'lucide-react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState([]);
  const [userProgress, setUserProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollment();
  }, [id]);

  // ========== IMAGE LOGIC ==========
  const getThumbnailUrl = (courseData) => {
    if (!courseData) return null;
    
    if (courseData.thumbnail && typeof courseData.thumbnail === 'string' && courseData.thumbnail.trim() !== '') {
      let url = courseData.thumbnail;
      
      if (url.startsWith('/')) {
        if (window.location.hostname === 'localhost') {
          url = `http://localhost:3000${url}`;
        } else {
          url = `${window.location.origin}${url}`;
        }
      }
      
      console.log(`✅ CourseDetail Thumbnail URL:`, url);
      return url;
    }
    
    const possibleFields = [
      'thumbnailUrl', 'thumbnail_url', 'image', 'imageUrl', 
      'image_url', 'coverImage', 'cover_image', 'banner'
    ];
    
    for (const field of possibleFields) {
      if (courseData[field] && typeof courseData[field] === 'string' && courseData[field].trim() !== '') {
        let url = courseData[field];
        
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

  const hasImageFailed = () => {
    return failedImages.has(id);
  };

  const handleImageError = () => {
    console.error(`❌ Image failed to load for course ${id}`);
    setFailedImages(prev => new Set([...prev, id]));
  };

  // ========== REST OF THE FUNCTIONS ==========
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await API.get(`/courses/${id}`);
      
      let courseData = response.data?.course || response.data?.data || response.data;

      if (!courseData) {
        throw new Error('Course not found');
      }

      let totalLessons = 0;
      let totalDuration = 0;
      
      if (courseData.modules && courseData.modules.length > 0) {
        courseData.modules.forEach(module => {
          if (module.lessons && module.lessons.length > 0) {
            totalLessons += module.lessons.length;
            totalDuration += module.lessons.reduce((sum, lesson) => 
              sum + (lesson.duration || 0), 0);
          }
        });
      }

      setCourse({
        ...courseData,
        totalLessons,
        totalDuration
      });

      if (courseData.modules?.length > 0) {
        setExpandedModules([courseData.modules[0].id]);
      }

    } catch (error) {
      console.error('Error fetching course:', error);
      if (error.response?.status === 404) {
        setError('This course is not available right now.');
      } else if (error.response?.status === 401) {
        setError('Please sign in to view course details');
        navigate('/login');
      } else {
        setError('Could not load course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await API.get('/enrollments/me');
      const enrolled = response.data?.some(enrollment => 
        enrollment.courseId === parseInt(id) || enrollment.course?.id === parseInt(id)
      );
      setIsEnrolled(enrolled);
      
      if (enrolled) {
        const enrollment = response.data.find(e => e.courseId === parseInt(id) || e.course?.id === parseInt(id));
        setUserProgress(enrollment?.progress || 0);
      }
    } catch (err) {
      console.log('Enrollment check failed:', err.message);
    }
  };

  const handleEnroll = async () => {
    try {
      await API.post('/enrollments/free', { courseId: parseInt(id) });
      setIsEnrolled(true);
      setUserProgress(0);
      
      setTimeout(() => {
        navigate(`/learn/${id}`);
      }, 1000);
    } catch (error) {
      console.error('Enrollment error:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { returnTo: `/courses/${id}` } });
      } else if (error.response?.status === 409) {
        setIsEnrolled(true);
        navigate(`/learn/${id}`);
      } else {
        setError('Unable to enroll. Please try again.');
      }
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getContentTypeIcon = (contentType) => {
    switch(contentType?.toUpperCase()) {
      case 'VIDEO': return Video;
      case 'ARTICLE': return FileText;
      case 'QUIZ': return BarChart;
      case 'AUDIO': return Headphones;
      case 'FILE': return Download;
      default: return FileVideo;
    }
  };

  const getContentTypeLabel = (contentType) => {
    switch(contentType?.toUpperCase()) {
      case 'VIDEO': return 'Video';
      case 'ARTICLE': return 'Article';
      case 'QUIZ': return 'Quiz';
      case 'AUDIO': return 'Audio';
      case 'FILE': return 'Resource';
      default: return contentType || 'Content';
    }
  };

  const getDifficultyBadge = (level) => {
    const levelLower = (level || 'beginner').toLowerCase();
    const badges = {
      'beginner': { text: 'Beginner', color: 'text-blue-700', bg: 'bg-blue-50' },
      'intermediate': { text: 'Intermediate', color: 'text-blue-700', bg: 'bg-blue-50' },
      'advanced': { text: 'Advanced', color: 'text-blue-700', bg: 'bg-blue-50' }
    };
    return badges[levelLower] || { text: 'All Levels', color: 'text-gray-700', bg: 'bg-gray-50' };
  };

  // Get thumbnail URL for current course
  const thumbnailUrl = course ? getThumbnailUrl(course) : null;
  const imageFailed = hasImageFailed();
  const difficulty = getDifficultyBadge(course?.level);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-48 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-100 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Navbar />
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Course Unavailable</h2>
          <p className="text-gray-500 mb-8">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const isFree = course.price === 0 || !course.price;
  const enrolledCount = course.enrollmentsCount || 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      
    

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button 
            onClick={() => navigate('/courses')}
            className="hover:text-blue-600 transition-colors"
          >
            Courses
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{course.title}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2">
            {/* Course Image Section */}
            <div className="relative mb-8">
              <div className="relative h-80 rounded-xl overflow-hidden bg-gray-50">
                {thumbnailUrl && !imageFailed ? (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    
                    {/* Minimal Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    
                    {/* Difficulty Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${difficulty.color} ${difficulty.bg} border border-gray-200`}>
                        {difficulty.text}
                      </span>
                    </div>

                    {/* Price Badge */}
                    {!isFree && (
                      <div className="absolute top-4 right-4">
                        <div className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600">
                          ${course.price || 0}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <BookOpen className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      No thumbnail available
                    </p>
                  </div>
                )}
              </div>
              
              {/* Course Stats - Minimal */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {course.modules?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Modules</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {course.totalLessons || 0}
                  </div>
                  <div className="text-xs text-gray-500">Lessons</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDuration(course.totalDuration)}
                  </div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {enrolledCount.toLocaleString()}+
                  </div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
              </div>
            </div>

            {/* Course Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Course Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Course Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {course.rating ? course.rating.toFixed(1) : '4.7'}
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {enrolledCount.toLocaleString()}+
                      </div>
                      <div className="text-xs text-gray-500">Students</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatDuration(course.totalDuration)}
                      </div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileVideo className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {course.totalLessons || 0}
                      </div>
                      <div className="text-xs text-gray-500">Lessons</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Highlights */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  What You'll Learn
                </h3>
                <div className="grid md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Downloadable Resources</span>
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Community Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section (if enrolled) */}
            {isEnrolled && userProgress > 0 && (
              <div className="bg-white rounded-lg p-5 mb-8 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Progress</h3>
                    <p className="text-xs text-gray-500">Keep going! You're doing great</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{userProgress}%</span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${userProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs Navigation - Minimal */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'curriculum'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab('instructor')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'instructor'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Instructor
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews
                </button>
              </nav>
            </div>

            {/* Tabs Content */}
            <div className="mb-12">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Overview</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {course.fullDescription || course.description}
                    </p>
                  </div>
                  
                  {/* Prerequisites */}
                  {course.prerequisites && (
                    <div className="bg-gray-50 rounded-lg p-5">
                      <h4 className="font-semibold text-gray-800 mb-2">Prerequisites</h4>
                      <p className="text-gray-600 text-sm">{course.prerequisites}</p>
                    </div>
                  )}
                  
                  {/* Learning Outcomes */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Learning Outcomes</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Master key concepts and practical applications
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'curriculum' && course.modules && (
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          if (expandedModules.includes(module.id)) {
                            setExpandedModules(expandedModules.filter(id => id !== module.id));
                          } else {
                            setExpandedModules([...expandedModules, module.id]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-300">
                            <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{module.title}</h4>
                            <p className="text-xs text-gray-500">
                              {module.lessons?.length || 0} lessons • {formatDuration(
                                module.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0
                              )}
                            </p>
                          </div>
                        </div>
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      {expandedModules.includes(module.id) && module.lessons && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => {
                              const Icon = getContentTypeIcon(lesson.contentType);
                              return (
                                <div 
                                  key={lesson.id} 
                                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                      <Icon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-900">
                                        {lessonIndex + 1}. {lesson.title}
                                      </h5>
                                      <p className="text-xs text-gray-500">
                                        {getContentTypeLabel(lesson.contentType)} • {formatDuration(lesson.duration || 0)}
                                      </p>
                                    </div>
                                  </div>
                                  {lesson.isPreview && (
                                    <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded">
                                      Preview
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'instructor' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">John Smith</h3>
                      <p className="text-sm text-gray-600 mb-2">Senior Developer & Instructor</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>10,000+ students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>4.8 rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    With over 10 years of experience in software development and teaching, John has helped thousands of students master modern web technologies. His practical approach focuses on real-world applications.
                  </p>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Student Reviews</h3>
                      <p className="text-sm text-gray-500">Average rating: 4.7 • 1,234 reviews</p>
                    </div>
                  </div>
                  
                  {/* Sample Reviews */}
                  {[1, 2].map((review) => (
                    <div key={review} className="border border-gray-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Alex Johnson</h4>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">2 weeks ago</span>
                      </div>
                      <p className="text-gray-600">
                        Excellent course! The instructor explains complex concepts in a very understandable way. The practical exercises were especially helpful.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Preview Section */}
              <div 
                className="relative h-40 bg-gray-50 overflow-hidden"
                onClick={() => {
                  if (thumbnailUrl && !imageFailed) {
                    window.open(thumbnailUrl, '_blank');
                  }
                }}
              >
                {thumbnailUrl && !imageFailed ? (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Pricing Section */}
              <div className="p-5">
                <div className="text-center mb-5">
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {isFree ? 'Free' : `$${course.price || 0}`}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Lifetime access</p>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      {course.totalLessons} lessons
                    </span>
                  </div>
                  
                  {course.totalDuration > 0 && (
                    <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        {formatDuration(course.totalDuration)} of content
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Certificate of completion</span>
                  </div>
                </div>

                {/* CTA Button */}
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/learn/${id}`)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-3"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-3"
                  >
                    {isFree ? (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Enroll for Free
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Enroll Now
                      </>
                    )}
                  </button>
                )}

                {/* Guarantee */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Course Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{course.category?.name || 'General'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Level</span>
                  <span className="font-medium text-gray-900">{course.level || 'All Levels'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Updated</span>
                  <span className="font-medium text-gray-900">
                    {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Language</span>
                  <span className="font-medium text-gray-900">English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;