import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  PlayCircle,
  Award,
  Zap,
  Heart,
  Eye,
  Lock,
  X,
  ChevronLeft
} from 'lucide-react';
import API from '../../api/axios';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCourse, setHoveredCourse] = useState(null);

  // Modal / Player state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [watchedLessons, setWatchedLessons] = useState({});

  const videoRef = useRef(null);

  // Helpers
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getInstructorName = (course) => {
    if (!course.instructor) return 'Unknown Instructor';
    if (typeof course.instructor === 'string') return course.instructor;
    if (course.instructor.name) return course.instructor.name;
    return 'Unknown Instructor';
  };

  const getCategoryName = (course) => {
    if (!course.category) return 'Uncategorized';
    if (typeof course.category === 'string') return course.category;
    if (course.category.name) return course.category.name;
    return 'Uncategorized';
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

  // Load watched lessons from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('watchedLessons_v1') || '{}';
      setWatchedLessons(JSON.parse(raw));
    } catch (e) {
      setWatchedLessons({});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('watchedLessons_v1', JSON.stringify(watchedLessons));
    } catch (e) {}
  }, [watchedLessons]);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/courses');
      let coursesData = [];
      if (response.data?.data) coursesData = response.data.data;
      else if (Array.isArray(response.data)) coursesData = response.data;
      else if (response.data?.courses) coursesData = response.data.courses;
      setCourses(coursesData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // Enrollment
  const handleEnroll = async (courseId, e) => {
    e.stopPropagation();
    try {
      setError('');
      await API.post(`/courses/${courseId}/enroll`);
      setCourses(prev => prev.map(course => {
        const id = course.id || course._id;
        if (id === courseId) {
          return { ...course, enrollmentsCount: (course.enrollmentsCount || 0) + 1, isEnrolled: true };
        }
        return course;
      }));
      openCoursePlayer(courseId, { autoEnrollContinue: true });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate('/login');
      else setError(err.response?.data?.message || 'Failed to enroll');
    }
  };

  // Open modal & load course
  const openCoursePlayer = async (courseId, options = {}) => {
    setCourseError('');
    setCourseLoading(true);
    setPlayerOpen(true);
    setActiveCourse(null);
    setActiveLesson(null);
    try {
      const res = await API.get(`/courses/${courseId}`);
      const courseDetail = res.data || res.data?.data || res.data?.course || res.data?.courses?.[0];
      const normalized = {
        ...courseDetail,
        modules: (courseDetail.modules || []).map(m => ({
          ...m,
          lessons: (m.lessons || []).sort((a,b) => (a.order || 0) - (b.order || 0))
        }))
      };
      setActiveCourse(normalized);
      let firstLesson = null;
      for (const m of normalized.modules) {
        if (m.lessons && m.lessons.length) { firstLesson = m.lessons[0]; break; }
      }
      if (firstLesson) setActiveLesson(firstLesson);
    } catch (err) {
      console.error(err);
      setCourseError(err.response?.data?.message || 'Failed to load course details');
    } finally { setCourseLoading(false); }
  };

  const closePlayer = () => {
    setPlayerOpen(false);
    setActiveCourse(null);
    setActiveLesson(null);
    if (videoRef.current && !videoRef.current.paused) try { videoRef.current.pause(); } catch(e) {}
  };

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    setTimeout(() => { try { videoRef.current?.play(); } catch(e) {} }, 150);
  };

  const markLessonWatched = (courseId, lessonId) => {
    setWatchedLessons(prev => {
      const courseKey = String(courseId);
      const copy = { ...prev };
      copy[courseKey] = copy[courseKey] || {};
      copy[courseKey][String(lessonId)] = true;
      return copy;
    });
  };

  const onVideoEnded = () => {
    if (!activeCourse || !activeLesson) return;
    markLessonWatched(activeCourse.id || activeCourse._id, activeLesson.id || activeLesson._id);
    if (!activeCourse.modules) return;
    let found = false; let next = null;
    for (let mi = 0; mi < activeCourse.modules.length; mi++) {
      const m = activeCourse.modules[mi];
      for (let li = 0; li < (m.lessons || []).length; li++) {
        const lesson = m.lessons[li];
        if (lesson.id === activeLesson.id) {
          next = m.lessons[li + 1] || (activeCourse.modules[mi + 1]?.lessons?.[0] || null);
          found = true; break;
        }
      }
      if (found) break;
    }
    if (next) handleSelectLesson(next);
  };

  const resolveLessonUrl = (lesson) => lesson?.contentUrl || lesson?.fileUrl || lesson?.url || lesson?.source || null;

  const onCourseCardClick = (course) => { openCoursePlayer(course.id || course._id); };

  // NEW: get first video lesson URL for preview
  const getFirstVideoLessonUrl = (course) => {
    if (!course.modules) return null;
    for (const mod of course.modules) {
      if (!mod.lessons) continue;
      for (const lesson of mod.lessons) {
        if (lesson.contentType === 'VIDEO' && resolveLessonUrl(lesson)) {
          return resolveLessonUrl(lesson);
        }
      }
    }
    return null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Courses Collection</h1>
          <p className="text-gray-600">Discover courses with video previews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-16">No courses available</div>
          ) : courses.map((course) => {
            const id = course.id || course._id;
            const isEnrolled = course.isEnrolled || false;
            const difficulty = getDifficultyBadge(course.level);
            const isFree = (course.price || 0) === 0;
            const instructorName = getInstructorName(course);
            const categoryName = getCategoryName(course);
            const videoUrl = getFirstVideoLessonUrl(course);

            return (
              <div key={id} className="group relative" onMouseEnter={() => setHoveredCourse(id)} onMouseLeave={() => setHoveredCourse(null)}>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer" onClick={() => onCourseCardClick(course)}>
                  {/* Ribbon */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${difficulty.bg}`}>{difficulty.text}</span>
                  </div>

                  {/* Price */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`px-4 py-2 rounded-xl font-bold text-white shadow-lg ${isFree ? 'bg-green-500' : 'bg-blue-600'}`}>
                      {isFree ? 'FREE' : `$${course.price}`}
                    </div>
                  </div>

                  {/* Video / Thumbnail */}
                  <div className="h-56 relative overflow-hidden">
                    {videoUrl ? (
                      <video src={videoUrl} muted loop autoPlay className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    ) : course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div className="text-white">
                        <h4 className="text-lg font-bold">{course.title}</h4>
                        <p className="text-sm line-clamp-2">{course.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <button
                      onClick={(e) => handleEnroll(id, e)}
                      className={`w-full py-3 rounded-xl font-bold text-white ${isEnrolled || isFree ? 'bg-green-500' : 'bg-blue-600'}`}
                    >
                      {isEnrolled ? 'Continue Learning' : isFree ? 'Enroll Free' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Player */}
      {playerOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={closePlayer}></div>
          <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <button onClick={closePlayer}><ChevronLeft className="w-5 h-5" /></button>
                <div>
                  <h3 className="font-semibold">{activeCourse.title}</h3>
                  <p className="text-xs text-gray-500">{getInstructorName(activeCourse)} • {getCategoryName(activeCourse)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeCourse.price > 0 ? <div className="px-3 py-1 rounded-md bg-yellow-50 text-yellow-700">${activeCourse.price}</div> : <div className="px-3 py-1 rounded-md bg-green-50 text-green-700">Free</div>}
                <button onClick={closePlayer}><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-2/3 bg-black">
                {activeLesson ? (
                  <video ref={videoRef} key={resolveLessonUrl(activeLesson)} src={resolveLessonUrl(activeLesson)} controls onEnded={onVideoEnded} className="w-full h-[420px] object-contain bg-black" />
                ) : (
                  <div className="h-[420px] flex items-center justify-center text-white">Select a lesson to start</div>
                )}
              </div>

              <div className="w-full lg:w-1/3 border-l border-gray-100 max-h-[640px] overflow-auto p-4">
                <h4 className="font-semibold mb-2">Course Content</h4>
                {activeCourse.modules?.map((mod, mi) => (
                  <div key={mod.id || mod._id} className="mb-4">
                    <div className="font-semibold">{mod.title}</div>
                    <div className="space-y-2 mt-2">
                      {mod.lessons?.map((lesson, li) => {
                        const lid = lesson.id || lesson._id;
                        const courseIdKey = String(activeCourse.id || activeCourse._id);
                        const watched = !!(watchedLessons[courseIdKey]?.[String(lid)]);
                        return (
                          <button key={lid} onClick={() => handleSelectLesson(lesson)} className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-md"><PlayCircle className="w-5 h-5 text-blue-600" /></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium truncate">{lesson.title}</div>
                                <div className="text-xs text-gray-400">{lesson.length ? formatDuration(lesson.length) : ''}</div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {lesson.contentType && <span className="uppercase">{lesson.contentType}</span>} {watched && <span className="text-green-600">Watched</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
