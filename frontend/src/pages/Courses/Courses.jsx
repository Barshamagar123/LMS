import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  Eye,
  Lock
} from 'lucide-react';
import API from '../../api/axios';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

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

  // SIMPLIFIED: Get thumbnail URL - FIXED VERSION
  const getThumbnailUrl = (course) => {
    // First, log what we're working with
    console.log('🔍 Checking course thumbnail for:', course.title, course);
    
    // Check common field names
    const thumbnailFields = [
      'thumbnail',
      'thumbnailUrl', 
      'thumbnail_url',
      'thumbnail_path',
      'image',
      'imageUrl',
      'image_url',
      'coverImage',
      'cover_image',
      'banner',
      'bannerUrl'
    ];
    
    for (const field of thumbnailFields) {
      if (course[field] && typeof course[field] === 'string' && course[field].trim() !== '') {
        let url = course[field];
        console.log(`✅ Found thumbnail in field "${field}":`, url);
        
        // Convert relative paths to absolute URLs
        if (url.startsWith('/uploads/')) {
          url = `http://localhost:3000${url}`;
        } else if (url.startsWith('uploads/')) {
          url = `http://localhost:3000/${url}`;
        }
        
        return url;
      }
    }
    
    console.log('❌ No thumbnail found in course:', course.title);
    return null;
  };

  // --- Fetch Courses ---
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Fetching courses from API...');
      const response = await API.get('/courses'); 
      
      console.log('📊 RAW API RESPONSE:', response);
      console.log('📊 Response data structure:', {
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        isArray: Array.isArray(response.data),
        dataType: typeof response.data
      });
      
      // Handle different response structures
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
      
      if (coursesData.length > 0) {
        // Log thumbnail info for ALL courses
        coursesData.forEach((course, index) => {
          console.log(`🎯 Course ${index + 1}: "${course.title}"`, {
            id: course.id,
            // Check ALL fields for thumbnails
            thumbnail: course.thumbnail,
            thumbnailUrl: course.thumbnailUrl,
            thumbnail_path: course.thumbnail_path,
            thumbnail_url: course.thumbnail_url,
            image: course.image,
            imageUrl: course.imageUrl,
            image_url: course.image_url,
            coverImage: course.coverImage,
            cover_image: course.cover_image,
            // Check if thumbnail is nested
            media: course.media,
            images: course.images,
            // All fields for debugging
            allFields: Object.keys(course)
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
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <div className="font-semibold">Error:</div>
            <div>{error}</div>
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

            console.log(`🖼️ Rendering course ${id}:`, {
              title: course.title,
              thumbnailUrl,
              hasThumbnail: !!thumbnailUrl
            });

            return (
              <div key={id} className="group relative">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                  
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

                  {/* Course Image - UPDATED TO SHOW ACTUAL THUMBNAIL */}
                  <div 
                    className="h-56 relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 cursor-pointer group"
                    onClick={() => goToCourseDetails(id)}
                  >
                    {thumbnailUrl ? (
                      <>
                        <img
                          src={thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            console.error('❌ Image load failed:', thumbnailUrl);
                            e.target.style.display = 'none';
                            // Create fallback element
                            const parent = e.target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100';
                              fallback.innerHTML = `
                                <div class="w-16 h-16 text-gray-400 mb-3">📚</div>
                                <p class="text-gray-500">${course.title}</p>
                                <p class="text-xs text-gray-400 mt-2">Thumbnail failed to load</p>
                              `;
                              parent.appendChild(fallback);
                            }
                          }}
                          onLoad={(e) => {
                            console.log('✅ Image loaded successfully:', thumbnailUrl);
                          }}
                        />
                        {/* Debug info - only show in development */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Thumbnail: {course.thumbnail ? 'Yes' : 'No'}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mb-3">
                          <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-700 font-medium text-center">{course.title}</p>
                        <p className="text-sm text-gray-500 mt-2">No thumbnail available</p>
                        {process.env.NODE_ENV === 'development' && (
                          <div className="mt-2 text-xs text-gray-400 text-center">
                            Fields: {Object.keys(course).filter(k => 
                              k.includes('thumb') || k.includes('image') || k.includes('cover')
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Course Title */}
                    <h3 
                      className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 cursor-pointer hover:text-blue-600"
                      onClick={() => goToCourseDetails(id)}
                    >
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {course.description || 'No description available'}
                    </p>
                    
                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {totalLessons} lessons
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {totalDuration}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.enrollmentsCount || 0}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {(course.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
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

        {/* Debug panel at bottom */}
        {process.env.NODE_ENV === 'development' && courses.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <details>
              <summary className="cursor-pointer font-semibold text-gray-700">
                Debug Information ({courses.length} courses)
              </summary>
              <div className="mt-2 text-sm">
                <div>First course data:</div>
                <pre className="bg-gray-800 text-gray-100 p-2 rounded mt-1 overflow-auto max-h-60">
                  {JSON.stringify(courses[0], null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;