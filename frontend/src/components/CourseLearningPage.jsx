import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  Video, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  BarChart, 
  Headphones,
  Download,
  Award,
  AlertCircle,
  Users,
  Star
} from 'lucide-react';
import API from '../api/axios';

const CourseLearningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch course details
      const courseRes = await API.get(`/courses/${id}`);
      const courseData = courseRes.data?.course || courseRes.data?.data || courseRes.data;
      
      if (!courseData) {
        throw new Error('Course not found');
      }

      // 2. Fetch enrollment status
      const enrollmentRes = await API.get('/enrollments/me');
      const userEnrollment = enrollmentRes.data?.find(e => 
        e.courseId === parseInt(id) || e.course?.id === parseInt(id)
      );
      
      if (!userEnrollment) {
        // Redirect to course details page if not enrolled
        navigate(`/courses/${id}`, { 
          state: { message: 'Please enroll in this course first' } 
        });
        return;
      }
      
      setEnrollment(userEnrollment);
      if (userEnrollment.completedLessons) {
        setCompletedLessons(new Set(userEnrollment.completedLessons));
      }
      
      setCourse(courseData);
      
      // Expand first module by default
      if (courseData.modules?.length > 0) {
        setExpandedModules([courseData.modules[0].id]);
        
        // Find first incomplete lesson
        const firstIncomplete = findFirstIncompleteLesson(courseData.modules, completedLessons);
        if (firstIncomplete) {
          setCurrentLesson(firstIncomplete);
        } else if (courseData.modules[0]?.lessons?.[0]) {
          setCurrentLesson(courseData.modules[0].lessons[0]);
        }
      }
      
    } catch (err) {
      console.error('Error loading course:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Course not found');
      } else {
        setError(err.message || 'Failed to load course');
      }
    } finally {
      setLoading(false);
    }
  };

  const findFirstIncompleteLesson = (modules, completedSet) => {
    for (const module of modules) {
      if (module.lessons) {
        for (const lesson of module.lessons) {
          if (!completedSet.has(lesson.id)) {
            return lesson;
          }
        }
      }
    }
    return null;
  };

  const getContentTypeIcon = (contentType) => {
    switch(contentType?.toUpperCase()) {
      case 'VIDEO': return Video;
      case 'ARTICLE': return FileText;
      case 'QUIZ': return BarChart;
      case 'AUDIO': return Headphones;
      case 'FILE': return Download;
      default: return FileText;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const markLessonComplete = async (lessonId) => {
    try {
      if (!enrollment?.id) {
        throw new Error('Enrollment not found');
      }

      // Call the API to update progress
      const response = await API.post(`/enrollments/${enrollment.id}/progress`, {
        lessonId: Number(lessonId),
        completed: true
      });
      
      // Update local state
      const updatedEnrollment = response.data;
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      setEnrollment(updatedEnrollment);
      
      // Show success message
      setError('Lesson marked as complete!');
      setTimeout(() => setError(''), 3000);
      
      // Find next incomplete lesson
      if (course?.modules) {
        const nextLesson = findFirstIncompleteLesson(course.modules, new Set([...completedLessons, lessonId]));
        if (nextLesson) {
          setCurrentLesson(nextLesson);
        }
      }
      
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      setError(err.response?.data?.message || 'Failed to update progress. Please try again.');
    }
  };

  const calculateProgress = () => {
    if (!course?.modules) return 0;
    const totalLessons = course.modules.reduce((sum, module) => 
      sum + (module.lessons?.length || 0), 0
    );
    return totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Unable to Access Course</h2>
          <p className="text-gray-600 mb-8">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">{course.title}</h1>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(course.totalDuration || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {course.rating || 4.5}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-sm text-gray-600">Your Progress</div>
                <div className="text-lg font-semibold text-gray-900">{progress}%</div>
              </div>
              <button
                onClick={() => navigate(`/courses/${id}`)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Course Details
              </button>
            </div>
          </div>
          
          {/* Mobile Header */}
          <div className="md:hidden pb-4">
            <h1 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{progress}% Complete</span>
                <span>{completedLessons.size} lessons done</span>
              </div>
              <div className="text-sm font-medium text-blue-600">{enrollment?.progress || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {error && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ${error.includes('complete') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2">
            {/* Current Lesson Card */}
            {currentLesson && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Current Lesson</h2>
                  <span className="text-sm text-gray-500">
                    {formatDuration(currentLesson.duration || 0)}
                  </span>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{currentLesson.title}</h3>
                  <p className="text-gray-600">{currentLesson.description}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => markLessonComplete(currentLesson.id)}
                    disabled={completedLessons.has(currentLesson.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex-1 flex items-center justify-center gap-2 ${
                      completedLessons.has(currentLesson.id)
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {completedLessons.has(currentLesson.id) ? 'Completed' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => {/* Open lesson content modal or page */}}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex-1 flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Start Lesson
                  </button>
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {completedLessons.size} of {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} lessons completed
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {course.modules?.map((module, moduleIndex) => (
                  <div key={module.id || moduleIndex}>
                    <div 
                      className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        if (expandedModules.includes(module.id)) {
                          setExpandedModules(expandedModules.filter(id => id !== module.id));
                        } else {
                          setExpandedModules([...expandedModules, module.id]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-600">{moduleIndex + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-500">
                            {module.lessons?.length || 0} lessons • {
                              formatDuration(
                                module.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0
                              )
                            }
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
                      <div className="px-6 pb-6">
                        <div className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => {
                            const Icon = getContentTypeIcon(lesson.contentType);
                            const isCompleted = completedLessons.has(lesson.id);
                            const isCurrent = currentLesson?.id === lesson.id;
                            
                            return (
                              <div 
                                key={lesson.id} 
                                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                                  isCurrent
                                    ? 'border-blue-300 bg-blue-50'
                                    : isCompleted
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                }`}
                                onClick={() => setCurrentLesson(lesson)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isCompleted 
                                        ? 'bg-green-100 text-green-600'
                                        : isCurrent
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircle className="w-4 h-4" />
                                      ) : (
                                        <Icon className="w-4 h-4" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className={`font-medium ${
                                        isCompleted 
                                          ? 'text-green-700'
                                          : isCurrent
                                          ? 'text-blue-700'
                                          : 'text-gray-900'
                                      }`}>
                                        {lessonIndex + 1}. {lesson.title}
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm mt-1">
                                        <span className="text-gray-500">
                                          {formatDuration(lesson.duration || 0)}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                          isCompleted 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                          {lesson.contentType || 'Lesson'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {isCompleted ? (
                                    <span className="text-sm text-green-600 font-medium">
                                      Completed
                                    </span>
                                  ) : isCurrent ? (
                                    <span className="text-sm text-blue-600 font-medium">
                                      Current
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentLesson(lesson);
                                      }}
                                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                      View
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Course Progress Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
              
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{progress}%</div>
                  <div className="text-sm text-gray-600">
                    {completedLessons.size} of {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} lessons
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Started</span>
                    <span className="font-medium text-gray-900">
                      {enrollment?.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last updated</span>
                    <span className="font-medium text-gray-900">
                      {enrollment?.updatedAt ? new Date(enrollment.updatedAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estimated completion</span>
                    <span className="font-medium text-gray-900">
                      {progress === 100 ? 'Completed' : 
                       progress > 90 ? 'This week' : 
                       progress > 50 ? '2 weeks' : '1 month'}
                    </span>
                  </div>
                </div>
                
                {progress === 100 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-700">Course Completed!</p>
                      <p className="text-sm text-green-600 mt-1">Congratulations on finishing this course</p>
                      <button
                        onClick={() => {/* Navigate to certificate */}}
                        className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        View Certificate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;