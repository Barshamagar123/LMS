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
  AlertCircle
} from 'lucide-react';
import API from '../../api/axios';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());

  // --- Helpers ---
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyBadge = (level) => {
    const levelLower = (level || 'beginner').toLowerCase();
    switch(levelLower) {
      case 'beginner':
        return { text: 'Beginner', bg: 'bg-gradient-to-r from-green-500 to-emerald-600' };
      case 'intermediate':
        return { text: 'Intermediate', bg: 'bg-gradient-to-r from-blue-500 to-cyan-600' };
      case 'advanced':
        return { text: 'Advanced', bg: 'bg-gradient-to-r from-purple-500 to-pink-600' };
      default:
        return { text: level || 'All Levels', bg: 'bg-gradient-to-r from-gray-500 to-gray-600' };
    }
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

  // FIXED: Get thumbnail URL
  const getThumbnailUrl = (course) => {
    // Check if course has thumbnail
    if (!course) return null;
    
    // Your API returns thumbnail in 'thumbnail' field
    if (course.thumbnail && typeof course.thumbnail === 'string' && course.thumbnail.trim() !== '') {
      let url = course.thumbnail;
      
      // If it's a relative path, prepend your server URL
      if (url.startsWith('/')) {
        // In development
        if (window.location.hostname === 'localhost') {
          url = `http://localhost:3000${url}`;
        } else {
          // In production, use the current origin
          url = `${window.location.origin}${url}`;
        }
      }
      
      console.log(`✅ Thumbnail URL for "${course.title}":`, url);
      return url;
    }
    
    // Check other possible field names as fallback
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
        
        console.log(`✅ Found thumbnail in "${field}" for "${course.title}":`, url);
        return url;
      }
    }
    
    console.log(`❌ No thumbnail found for "${course.title}"`);
    return null;
  };

  // Check if image failed to load
  const hasImageFailed = (courseId) => {
    return failedImages.has(courseId);
  };

  // --- Fetch Courses ---
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      setFailedImages(new Set()); // Reset failed images
      
      console.log('🚀 Fetching courses from API...');
      const response = await API.get('/courses'); 
      
      console.log('📊 API Response:', response);
      
      // Handle response structure
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
      
      console.log(`📈 Found ${coursesData.length} courses`);
      
      // Log thumbnail information for debugging
      if (coursesData.length > 0) {
        coursesData.forEach((course, index) => {
          const thumbnailUrl = getThumbnailUrl(course);
          console.log(`🎯 Course ${index + 1}: "${course.title}"`, {
            id: course.id,
            hasThumbnailField: !!course.thumbnail,
            thumbnail: course.thumbnail,
            thumbnailUrl: thumbnailUrl,
            allFields: Object.keys(course).filter(k => 
              k.includes('thumb') || k.includes('image') || k.includes('cover')
            )
          });
        });
      }
      
      setCourses(coursesData);
      
    } catch (err) {
      console.error('❌ Fetch courses error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('🔄 CoursesPage mounted, fetching courses...');
    fetchCourses(); 
  }, []);

  // Handle image load error
  const handleImageError = (courseId) => {
    console.error(`❌ Image failed to load for course ${courseId}`);
    setFailedImages(prev => new Set([...prev, courseId]));
  };

  // --- Enrollment Handler ---
  const handleEnroll = async (courseId, e) => {
    e.stopPropagation(); 
    
    try {
      setEnrollingCourseId(courseId);
      setError('');
      
      const course = courses.find(c => c.id === courseId);
      const isFree = (course?.price || 0) === 0;

      if (isFree) {
        await API.post('/enrollments/free', { courseId });
        
        setCourses(prev => prev.map(c => 
          c.id === courseId ? { ...c, enrollmentsCount: (c.enrollmentsCount || 0) + 1, isEnrolled: true } : c
        ));
        
        navigate(`/courses/${courseId}`);
      } else {
        navigate(`/checkout/${courseId}`);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      const status = err.response?.status;

      if (status === 401) {
        navigate('/login', { 
          state: { from: `/courses/${courseId}`, message: 'Please login to enroll in this course' } 
        });
      } else if (status === 409) {
        alert('You are already enrolled in this course. Redirecting...');
        navigate(`/courses/${courseId}`);
      } else {
        setError(err.response?.data?.message || 'Failed to enroll');
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // --- Navigation Helpers ---
  const goToCourseDetails = (courseId, e) => {
    if(e) e.stopPropagation(); 
    navigate(`/courses/${courseId}`);
  };

  // --- Render Logic ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
      <div className="ml-4 text-gray-600">Loading courses...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Courses Collection</h1>
          <p className="text-gray-600">Discover and enroll in amazing courses</p>
          <button 
            onClick={() => {
              console.log('Current courses state:', courses);
              fetchCourses();
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Refresh & Debug
          </button>
        </div>

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
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : courses.map((course) => {
            const id = course.id;
            const isEnrolled = course.isEnrolled || false;
            const difficulty = getDifficultyBadge(course.level);
            const isFree = (course.price || 0) === 0;
            const isEnrolling = enrollingCourseId === id;
            const totalLessons = getTotalLessons(course);
            const totalDuration = getTotalCourseDuration(course);
            const thumbnailUrl = getThumbnailUrl(course);
            const imageFailed = hasImageFailed(id);

            console.log(`🖼️ Rendering course ${id}:`, {
              title: course.title,
              thumbnailUrl,
              imageFailed,
              hasThumbnail: !!thumbnailUrl && !imageFailed
            });

            return (
              <div key={id} className="group relative">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  
                  {/* Difficulty Ribbon */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${difficulty.bg}`}>
                      {difficulty.text}
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`px-4 py-2 rounded-xl font-bold text-white shadow-lg ${isFree ? 'bg-green-500' : 'bg-blue-600'}`}>
                      {isFree ? 'FREE' : `$${course.price || 0}`}
                    </div>
                  </div>

                  {/* Course Image */}
                  <div 
                    className="h-56 relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 cursor-pointer group flex-shrink-0"
                    onClick={() => goToCourseDetails(id)}
                  >
                    {thumbnailUrl && !imageFailed ? (
                      <>
                        <img
                          src={thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={() => handleImageError(id)}
                          onLoad={() => console.log(`✅ Image loaded: ${thumbnailUrl}`)}
                          loading="lazy"
                        />
                        
                        {/* Debug overlay (only in development) */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {course.thumbnail ? 'Has thumbnail' : 'No thumbnail'}
                          </div>
                        )}
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      // Fallback when no thumbnail or image failed
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center mb-3">
                          {imageFailed ? (
                            <Image className="w-8 h-8 text-gray-400" />
                          ) : (
                            <BookOpen className="w-8 h-8 text-blue-600" />
                          )}
                        </div>
                        <p className="text-gray-700 font-medium text-center text-sm">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {imageFailed ? 'Image failed to load' : 'No thumbnail available'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Course Title */}
                    <h3 
                      className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => goToCourseDetails(id)}
                      title={course.title}
                    >
                      {course.title}
                    </h3>
                    
                    {/* Course Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                      {course.description || 'No description available'}
                    </p>
                    
                    {/* Instructor Info */}
                    {course.instructor && (
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-semibold text-gray-700">
                            {course.instructor.name?.charAt(0) || 'I'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {course.instructor.name || 'Instructor'}
                        </span>
                      </div>
                    )}
                    
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center" title="Lessons">
                          <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                          {totalLessons}
                        </span>
                        <span className="flex items-center" title="Duration">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {totalDuration}
                        </span>
                        <span className="flex items-center" title="Enrollments">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {course.enrollmentsCount || 0}
                        </span>
                      </div>
                      <span className="flex items-center" title="Rating">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {(course.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-auto">
                      <button
                        onClick={(e) => goToCourseDetails(id, e)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>

                      <button
                        onClick={(e) => handleEnroll(id, e)}
                        disabled={isEnrolling}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center ${
                          isEnrolling ? 'opacity-70 cursor-not-allowed' : ''
                        } ${
                          isEnrolled 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : isFree 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {isEnrolling ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Processing...
                          </>
                        ) : isEnrolled ? (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            Go to Course
                          </>
                        ) : isFree ? (
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
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Debug panel */}
        {process.env.NODE_ENV === 'development' && courses.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <details className="cursor-pointer">
              <summary className="font-semibold text-gray-700 mb-2">
                📊 Debug Information ({courses.length} courses)
              </summary>
              <div className="mt-2 text-sm space-y-4">
                <div>
                  <div className="font-medium mb-1">First course details:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 text-gray-100 p-2 rounded">
                      <div className="font-semibold">Course 1:</div>
                      <pre className="overflow-auto max-h-32 mt-1">
                        {JSON.stringify(courses[0], null, 2)}
                      </pre>
                    </div>
                    <div className="bg-blue-900 text-blue-100 p-2 rounded">
                      <div className="font-semibold">Thumbnail Analysis:</div>
                      <div className="mt-1 space-y-1">
                        <div>Field 'thumbnail': {courses[0].thumbnail ? '✅ Yes' : '❌ No'}</div>
                        <div>Value: {courses[0].thumbnail || '(empty)'}</div>
                        <div className="break-all">URL: {getThumbnailUrl(courses[0]) || '(none)'}</div>
                        <div>Failed images: {Array.from(failedImages).join(', ') || '(none)'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium mb-1">Thumbnail Stats:</div>
                  <div className="text-xs">
                    {courses.filter(c => c.thumbnail).length} of {courses.length} courses have thumbnail field
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;