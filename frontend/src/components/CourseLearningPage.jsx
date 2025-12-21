import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Fullscreen, 
  Maximize2,
  Minimize,
  Settings,
  SkipBack, 
  SkipForward,
  RotateCcw,
  RotateCw,
  Captions,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Home,
  List,
  FileText,
  Download,
  Share2,
  ThumbsUp,
  MessageCircle,
  AlertCircle,
  Loader2,
  X,
  Zap,
  Award,
  Target
} from 'lucide-react';
import API from '../api/axios';

const CourseLearningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Core states
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Video player states
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  
  // UI states
  const [expandedModules, setExpandedModules] = useState([]);
  const [savingProgress, setSavingProgress] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, resources, notes, discussion
  const [quiz, setQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const enrollmentId = searchParams.get('enrollment');

  // Format time (HH:MM:SS)
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Load course data
  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Load course with modules and lessons
      const courseRes = await API.get(`/courses/${id}`);
      const courseData = courseRes.data?.data || courseRes.data;
      
      if (!courseData) {
        throw new Error('Course not found');
      }

      setCourse(courseData);

      // 2. Load enrollment if ID provided
      if (enrollmentId) {
        try {
          const enrollmentRes = await API.get(`/enrollments/${enrollmentId}`);
          const enrollmentData = enrollmentRes.data?.data || enrollmentRes.data;
          setEnrollment(enrollmentData);
          
          // Load completed lessons
          if (enrollmentData.id) {
            const progressRes = await API.get(`/lesson-progress/${enrollmentData.id}`);
            const progressData = progressRes.data?.data || progressRes.data;
            const completed = new Set(
              progressData.lessonProgress
                ?.filter(p => p.completed)
                .map(p => p.lessonId) || []
            );
            setCompletedLessons(completed);
          }
        } catch (err) {
          console.warn('Could not load enrollment:', err.message);
        }
      }

      // 3. Set first lesson as current
      if (courseData.modules?.[0]?.lessons?.[0]) {
        setCurrentLesson(courseData.modules[0].lessons[0]);
      }

      // 4. Expand first module
      if (courseData.modules?.[0]) {
        setExpandedModules([courseData.modules[0].id]);
      }

    } catch (err) {
      console.error('Failed to load course:', err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id, enrollmentId]);

  // Mark lesson as complete
  const markLessonComplete = async () => {
    if (!enrollment?.id || !currentLesson?.id) return;

    try {
      setSavingProgress(true);
      
      const response = await API.post(
        `/lesson-progress/${enrollment.id}/lessons/${currentLesson.id}/complete`
      );

      // Update local state
      setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
      
      // Show completion animation
      const completionEvent = new CustomEvent('lessonCompleted', {
        detail: { lessonId: currentLesson.id }
      });
      window.dispatchEvent(completionEvent);
      
      // Auto-advance after delay
      setTimeout(() => {
        if (course?.modules) {
          const allLessons = course.modules.flatMap(m => m.lessons || []);
          const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
          const nextLesson = allLessons[currentIndex + 1];
          
          if (nextLesson) {
            setCurrentLesson(nextLesson);
          } else {
            // Course completed
            showCourseCompletion();
          }
        }
      }, 1500);

    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const showCourseCompletion = () => {
    // Show completion modal or celebration
    console.log('Course completed!');
  };

  // Save video progress
  const saveProgress = useCallback(async (time) => {
    if (!enrollment?.id || !currentLesson?.id) return;

    try {
      await API.put(`/lesson-progress/${enrollment.id}/lessons/${currentLesson.id}/time`, {
        lastTime: time
      });
    } catch (err) {
      console.warn('Could not save progress:', err);
    }
  }, [enrollment?.id, currentLesson?.id]);

  // Video controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveProgress(newTime);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    
    if (!document.fullscreenElement) {
      container?.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      saveProgress(videoRef.current.currentTime);
    }
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  // Handle user activity
  const handleUserActivity = () => {
    setLastActiveTime(Date.now());
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        saveProgress(videoRef.current.currentTime);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [saveProgress, isPlaying]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(!isMuted);
          if (videoRef.current) videoRef.current.muted = !isMuted;
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percentage = parseInt(e.key) / 10;
          if (videoRef.current && duration) {
            videoRef.current.currentTime = duration * percentage;
            saveProgress(videoRef.current.currentTime);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration]);

  // Load course on mount
  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading course content...</p>
          <p className="text-sm text-gray-500 mt-2">Preparing your learning experience</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Course</h2>
          <p className="text-gray-300 mb-6">{error || 'Course not found or unavailable'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Courses
            </button>
            <button
              onClick={loadCourseData}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLessonCompleted = (lessonId) => completedLessons.has(lessonId);
  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
  const completedCount = completedLessons.size;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white" onClick={handleUserActivity}>
      {/* Top Navigation Bar */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/courses/${id}`)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                title="Course Details"
              >
                <Home className="w-5 h-5" />
                <span className="hidden md:inline">Course Overview</span>
              </button>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className="text-lg font-semibold truncate max-w-md">{course.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="font-semibold flex items-center gap-2">
                    <span>{progress}%</span>
                    <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Lessons</div>
                  <div className="font-semibold">{completedCount}/{totalLessons}</div>
                </div>
              </div>
              
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Notes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Video Player (YouTube Style) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Container */}
            <div 
              id="video-container"
              className="bg-black rounded-xl overflow-hidden relative group"
              onMouseMove={handleUserActivity}
              onDoubleClick={togglePlayPause}
            >
              {/* Video Player */}
              {currentLesson?.contentType === 'VIDEO' ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full aspect-video"
                    src={currentLesson.contentUrl}
                    onLoadedMetadata={(e) => {
                      setDuration(e.target.duration);
                      // Resume from saved position
                      if (enrollment?.lastTime) {
                        e.target.currentTime = enrollment.lastTime;
                      }
                    }}
                    onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => {
                      setIsPlaying(false);
                      // Auto-mark as complete when video ends
                      if (!isLessonCompleted(currentLesson.id) && duration > 60) {
                        markLessonComplete();
                      }
                    }}
                  />
                  
                  {/* YouTube-style Big Play Button */}
                  {!isPlaying && (
                    <button
                      onClick={togglePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all hover:bg-black/30"
                    >
                      <div className="w-20 h-20 bg-black/70 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                    </button>
                  )}
                  
                  {/* YouTube-style Video Controls */}
                  <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
                    showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    {/* Progress Bar Container */}
                    <div 
                      className="px-4 cursor-pointer group/progress"
                      onClick={handleSeek}
                    >
                      <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 rounded-full relative group-hover/progress:bg-red-500"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Controls Bar */}
                    <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 py-3">
                      <div className="flex items-center justify-between">
                        {/* Left Controls */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={togglePlayPause}
                            className="text-white hover:text-gray-300 transition-colors"
                            title={isPlaying ? 'Pause (k)' : 'Play (k)'}
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => skip(-10)}
                            className="text-gray-300 hover:text-white transition-colors"
                            title="Rewind 10s (j)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => skip(10)}
                            className="text-gray-300 hover:text-white transition-colors"
                            title="Forward 10s (l)"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                          
                          {/* Volume Control */}
                          <div className="flex items-center gap-2 group/volume">
                            <button
                              onClick={() => {
                                if (videoRef.current) {
                                  videoRef.current.muted = !isMuted;
                                  setIsMuted(!isMuted);
                                }
                              }}
                              className="text-gray-300 hover:text-white transition-colors"
                              title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                            >
                              {isMuted ? (
                                <VolumeX className="w-5 h-5" />
                              ) : volume > 0.5 ? (
                                <Volume2 className="w-5 h-5" />
                              ) : (
                                <Volume2 className="w-5 h-5" />
                              )}
                            </button>
                            
                            <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden opacity-0 group-hover/volume:opacity-100 transition-opacity">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => {
                                  const newVolume = parseFloat(e.target.value);
                                  setVolume(newVolume);
                                  if (videoRef.current) {
                                    videoRef.current.volume = newVolume;
                                    setIsMuted(newVolume === 0);
                                  }
                                }}
                                className="w-full h-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                              />
                            </div>
                          </div>
                          
                          {/* Time Display */}
                          <div className="text-sm text-gray-300 font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        </div>
                        
                        {/* Right Controls */}
                        <div className="flex items-center gap-3">
                          {/* Playback Speed */}
                          <div className="relative">
                            <button
                              onClick={() => setShowSettings(!showSettings)}
                              className="text-gray-300 hover:text-white transition-colors"
                              title="Settings"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                            
                            {showSettings && (
                              <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-10">
                                <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                                  Playback Speed
                                </div>
                                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                  <button
                                    key={rate}
                                    onClick={() => changePlaybackRate(rate)}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors ${
                                      playbackRate === rate ? 'text-blue-400 font-medium' : 'text-gray-300'
                                    }`}
                                  >
                                    {rate === 1 ? 'Normal' : `${rate}x`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="text-gray-300 hover:text-white transition-colors"
                            title="Transcript"
                          >
                            <Captions className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={toggleFullscreen}
                            className="text-gray-300 hover:text-white transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
                          >
                            {isFullscreen ? (
                              <Minimize className="w-5 h-5" />
                            ) : (
                              <Maximize2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lesson Title Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <div className="text-sm font-medium">{currentLesson?.title}</div>
                      <div className="text-xs text-gray-300 flex items-center gap-2">
                        <span>Lesson {currentLesson?.order}</span>
                        <span>•</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skip Intro Button */}
                  {currentTime < 30 && (
                    <button
                      onClick={() => skip(30)}
                      className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg text-sm hover:bg-black transition-colors"
                    >
                      Skip Intro
                    </button>
                  )}
                </>
              ) : (
                // Non-video content (PDF, DOC, etc.)
                <div className="aspect-video bg-gray-800 flex flex-col items-center justify-center p-8">
                  <BookOpen className="w-20 h-20 text-gray-600 mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">{currentLesson?.title || 'Reading Material'}</h3>
                  <p className="text-gray-400 text-center mb-6 max-w-lg">
                    This lesson contains reading material. Please review the content below.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Open Document
                    </button>
                    <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Info and Actions */}
            {currentLesson && (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{currentLesson.title}</h2>
                    <p className="text-gray-300">{currentLesson.description || 'No description available'}</p>
                    
                    {/* Lesson Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Lesson {currentLesson.order}</span>
                      </div>
                      {isLessonCompleted(currentLesson.id) && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={markLessonComplete}
                      disabled={isLessonCompleted(currentLesson.id) || savingProgress}
                      className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                        isLessonCompleted(currentLesson.id)
                          ? 'bg-green-900/30 text-green-400 cursor-default'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25'
                      }`}
                    >
                      {savingProgress ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {isLessonCompleted(currentLesson.id) ? 'Completed ✓' : 'Mark Complete'}
                    </button>
                    
                    <button className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg"
                  >
                    Take Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg"
                  >
                    Download Resources
                  </button>
                  <button
                    onClick={() => setActiveTab('discussion')}
                    className="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Discuss
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Content Area */}
            {showTranscript && (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Video Transcript</h3>
                  <button
                    onClick={() => setShowTranscript(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  <p className="text-gray-300">[Transcript would appear here synchronized with video]</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Learning Tools */}
          <div className="space-y-6">
            {/* Progress Stats Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Learning Progress
              </h3>
              
              <div className="space-y-6">
                {/* Progress Circle */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{progress}%</span>
                    <span className="text-sm text-gray-400">Complete</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{completedCount}</div>
                    <div className="text-sm text-gray-400">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{totalLessons - completedCount}</div>
                    <div className="text-sm text-gray-400">Remaining</div>
                  </div>
                </div>
                
                {/* Streak */}
                <div className="text-center p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-700/30">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">3 Day Streak!</span>
                  </div>
                  <div className="text-sm text-gray-300">Keep learning to maintain your streak</div>
                </div>
              </div>
            </div>

            {/* Course Content Navigation */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Course Content
                  </h3>
                  <span className="text-sm text-gray-400">{totalLessons} lessons</span>
                </div>
                
                {/* Module Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {course.modules?.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        if (!expandedModules.includes(module.id)) {
                          setExpandedModules([...expandedModules, module.id]);
                        }
                        // Scroll to module
                        document.getElementById(`module-${module.id}`)?.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                        expandedModules.includes(module.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Module {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto">
                {course.modules?.map((module, moduleIndex) => (
                  <div key={module.id} id={`module-${module.id}`} className="border-b border-gray-700 last:border-b-0">
                    <button
                      onClick={() => {
                        if (expandedModules.includes(module.id)) {
                          setExpandedModules(expandedModules.filter(id => id !== module.id));
                        } else {
                          setExpandedModules([...expandedModules, module.id]);
                        }
                      }}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          expandedModules.includes(module.id) 
                            ? 'bg-blue-600' 
                            : 'bg-gray-700'
                        }`}>
                          {expandedModules.includes(module.id) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-400">
                            {module.lessons?.length || 0} lessons • 
                            {module.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0} min
                          </p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        module.lessons?.every(l => isLessonCompleted(l.id))
                          ? 'bg-green-500'
                          : module.lessons?.some(l => isLessonCompleted(l.id))
                          ? 'bg-yellow-500'
                          : 'bg-gray-600'
                      }`} />
                    </button>
                    
                    {/* Module Lessons */}
                    {expandedModules.includes(module.id) && module.lessons && (
                      <div className="px-4 pb-4 space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isCurrent = currentLesson?.id === lesson.id;
                          const completed = isLessonCompleted(lesson.id);
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setCurrentLesson(lesson)}
                              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                                isCurrent
                                  ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50 shadow-lg shadow-blue-900/20'
                                  : completed
                                  ? 'bg-green-900/20 text-green-300 hover:bg-green-900/30'
                                  : 'text-gray-300 hover:bg-gray-700/50'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  completed ? 'bg-green-900' : 'bg-gray-700'
                                }`}>
                                  {completed ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    <span className="text-xs">{lessonIndex + 1}</span>
                                  )}
                                </div>
                                <span className="truncate flex-1 text-left">{lesson.title}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs">
                                {lesson.contentType === 'VIDEO' && (
                                  <Play className="w-3 h-3" />
                                )}
                                {lesson.contentType === 'PDF' && (
                                  <FileText className="w-3 h-3" />
                                )}
                                <Clock className="w-3 h-3" />
                                <span>{Math.floor(lesson.duration / 60) || 5}m</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg flex items-center justify-between group">
                  <span>Take Quiz</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg flex items-center justify-between group">
                  <span>Download Certificate</span>
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button className="w-full p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg flex items-center justify-between group">
                  <span>Ask Instructor</span>
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Panel (Slide-out) */}
      {showNotes && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-800 border-l border-gray-700 shadow-2xl z-50">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">My Notes</h3>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes here... You can format your notes with markdown. These notes will be saved automatically."
                className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Formatting Tips:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <code className="bg-gray-900 px-2 py-1 rounded"># Heading</code>
                  <code className="bg-gray-900 px-2 py-1 rounded">**Bold**</code>
                  <code className="bg-gray-900 px-2 py-1 rounded">*Italic*</code>
                  <code className="bg-gray-900 px-2 py-1 rounded">[Link](url)</code>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-2xl">
            {/* Quiz content */}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            alert(`
Keyboard Shortcuts:
Space/K - Play/Pause
F - Fullscreen
M - Mute/Unmute
J - Rewind 10s
L - Forward 10s
0-9 - Jump to percentage
Arrow Keys - Seek
            `);
          }}
          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-sm opacity-50 hover:opacity-100 transition-opacity"
          title="Keyboard Shortcuts"
        >
          ⌘K
        </button>
      </div>
    </div>
  );
};

export default CourseLearningPage;