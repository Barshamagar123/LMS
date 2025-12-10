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
  Heart
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

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollment();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get(`/courses/${id}`);
      
      let courseData = response.data?.course || response.data?.data || response.data;

      if (!courseData) {
        throw new Error('Course not found');
      }

      // Calculate totals from backend data
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

      // Expand first module by default
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

  if (loading) {
    return (

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Course Unavailable</h2>
          <p className="text-gray-600 mb-8">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const isFree = course.price === 0 || !course.price;
  const enrolledCount = course.enrollmentsCount || 0;
  const hasCurriculum = course.modules && course.modules.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
       <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Courses</span>
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-full ${isBookmarked ? 'bg-blue-700' : 'hover:bg-blue-700/50'} transition-colors`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2.5 hover:bg-blue-700/50 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
          <button 
            onClick={() => navigate('/courses')}
            className="hover:text-blue-600 transition-colors"
          >
            Courses
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {course.category?.name || 'General'}
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{course.title}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2">
            {/* Course Header Section */}
            <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl p-8 border border-blue-100 mb-8 shadow-sm">
              {/* Course Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                  {course.level || 'All Levels'}
                </span>
                <span className="px-4 py-1.5 bg-gradient-to-r from-green-100 to-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                  {isFree ? 'FREE' : `$${course.price}`}
                </span>
                <span className="px-4 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-sm font-semibold rounded-full border border-purple-200">
                  {course.status || 'PUBLISHED'}
                </span>
                {course.category?.name && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 text-sm font-semibold rounded-full border border-orange-200">
                    {course.category.name}
                  </span>
                )}
              </div>

              {/* Course Title & Description */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {course.title}
                </h1>
                
                <div className="bg-white/80 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Course Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Course Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {course.rating ? course.rating.toFixed(1) : '4.7'}
                      </div>
                      <div className="text-sm text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {enrolledCount.toLocaleString()}+
                      </div>
                      <div className="text-sm text-gray-500">Students</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatDuration(course.totalDuration)}
                      </div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                      <FileVideo className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {course.totalLessons || 0}
                      </div>
                      <div className="text-sm text-gray-500">Lessons</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Highlights */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Course Highlights
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Downloadable Resources</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Community Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section (if enrolled) */}
            {isEnrolled && userProgress > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Your Learning Progress</h3>
                    <p className="text-sm text-gray-600">Keep going! You're doing great</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{userProgress}%</span>
                </div>
                <div className="relative">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                      style={{ width: `${userProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl mb-8">
                {['overview', 'curriculum', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                      activeTab === tab
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="transition-all duration-300">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* What You'll Learn */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Target className="w-6 h-6 text-blue-600" />
                        What You'll Learn
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          'Master key concepts and techniques',
                          'Build practical projects',
                          'Develop problem-solving skills',
                          'Understand industry best practices',
                          'Learn from real-world examples',
                          'Gain hands-on experience'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-white transition-colors">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    {course.requirements && course.requirements.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <Briefcase className="w-6 h-6 text-blue-600" />
                          Requirements
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <ul className="space-y-3">
                            {course.requirements.map((req, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                                </div>
                                <span className="text-gray-700">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Course Structure */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        Course Structure
                      </h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                          <div className="text-3xl font-bold text-blue-700 mb-2">
                            {course.modules?.length || 0}
                          </div>
                          <div className="text-sm font-medium text-blue-600">Modules</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                          <div className="text-3xl font-bold text-green-700 mb-2">
                            {course.totalLessons || 0}
                          </div>
                          <div className="text-sm font-medium text-green-600">Lessons</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                          <div className="text-3xl font-bold text-purple-700 mb-2">
                            {formatDuration(course.totalDuration)}
                          </div>
                          <div className="text-sm font-medium text-purple-600">Total Duration</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                          Course Curriculum
                        </h3>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {course.modules?.length || 0} Modules
                          </span>
                          <span className="flex items-center gap-2">
                            <FileVideo className="w-4 h-4" />
                            {course.totalLessons || 0} Lessons
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDuration(course.totalDuration || 0)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {isEnrolled ? 'Enrolled' : 'Preview Available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {hasCurriculum ? (
                        [...course.modules]
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((module, index) => {
                            const moduleDuration = module.lessons?.reduce((total, lesson) => 
                              total + (lesson.duration || 0), 0) || 0;
                            const lessonCount = module.lessons?.length || 0;
                            
                            return (
                              <div key={module.id || index} className="hover:bg-gray-50 transition-colors">
                                <button
                                  onClick={() => setExpandedModules(prev => 
                                    prev.includes(module.id) 
                                      ? prev.filter(id => id !== module.id) 
                                      : [...prev, module.id]
                                  )}
                                  className="w-full flex items-center justify-between p-6"
                                >
                                  <div className="flex items-start gap-4 text-left">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                      <span className="text-lg font-bold text-blue-700">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-900 text-lg mb-1">
                                        {module.title || `Module ${index + 1}`}
                                      </h4>
                                      <p className="text-gray-600 text-sm">
                                        {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'} • {formatDuration(moduleDuration)}
                                      </p>
                                      {module.description && (
                                        <p className="text-gray-500 text-sm mt-1">
                                          {module.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {expandedModules.includes(module.id) ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </button>
                                
                                {expandedModules.includes(module.id) && module.lessons && module.lessons.length > 0 && (
                                  <div className="px-6 pb-6">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                      {module.lessons
                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                        .map((lesson, lessonIndex) => {
                                          const ContentIcon = getContentTypeIcon(lesson.contentType);
                                          const contentTypeLabel = getContentTypeLabel(lesson.contentType);
                                          
                                          return (
                                            <div key={lesson.id || lessonIndex} className="flex items-center justify-between py-3 px-4 bg-white rounded-lg mb-2 last:mb-0 hover:shadow-sm transition-shadow">
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                  <span className="text-sm font-medium text-gray-700">
                                                    {lessonIndex + 1}
                                                  </span>
                                                </div>
                                                <div>
                                                  <h5 className="font-medium text-gray-900">
                                                    {lesson.title || `Lesson ${lessonIndex + 1}`}
                                                  </h5>
                                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                      <ContentIcon className="w-3 h-3" />
                                                      {contentTypeLabel}
                                                    </span>
                                                    {lesson.duration && lesson.duration > 0 && (
                                                      <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDuration(lesson.duration)}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              {isEnrolled ? (
                                                <PlayCircle className="w-5 h-5 text-blue-600" />
                                              ) : (
                                                <Lock className="w-5 h-5 text-gray-400" />
                                              )}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            No Curriculum Available
                          </h4>
                          <p className="text-gray-600">
                            The instructor hasn't added any curriculum yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-200 p-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                          <div className="text-4xl font-bold text-gray-900 mb-2">
                            {course.rating ? course.rating.toFixed(1) : '4.7'}
                          </div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(course.rating || 4.7) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">Overall Rating</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Be the first to review this course!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Preview Section */}
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {isFree ? 'Free' : `$${course.price || 0}`}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">One-time payment • Lifetime access</p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      {course.totalLessons} {course.totalLessons === 1 ? 'lesson' : 'lessons'}
                    </span>
                  </div>
                  
                  {course.totalDuration > 0 && (
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        {formatDuration(course.totalDuration)} of content
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 py-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Certificate of completion</span>
                  </div>
                </div>

                {/* CTA Button */}
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/learn/${id}`)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 mb-4"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 mb-4"
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
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    <Shield className="w-4 h-4" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Facts
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Category</span>
                  <span className="font-medium text-gray-900">{course.category?.name || 'General'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Level</span>
                  <span className="font-medium text-gray-900">{course.level || 'All Levels'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Status</span>
                  <span className="font-medium text-gray-900">{course.status || 'Published'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Updated</span>
                  <span className="font-medium text-gray-900">
                    {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
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