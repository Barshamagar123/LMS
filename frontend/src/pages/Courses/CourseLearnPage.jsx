import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  MenuBook
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import API from '../../api/axios'; // Import your API instance
import VideoPlayer from '../../components/VideoPlayer';
import CoursePlayerLayout from '../../components/CoursePlayerLayout';
import PlaylistSidebar from '../../components/PlaylistSidebar';
import useCourseProgress from '../../hooks/useCourseProgress';

const CourseLearnPage = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollment');
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Progress tracking
  const { 
    progressData, 
    updateProgress, 
    markAsCompleted,
    isLoading: progressLoading 
  } = useCourseProgress(enrollmentId);
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!courseId || !enrollmentId) {
      setError("Course ID or Enrollment ID missing");
      setLoading(false);
      return;
    }
    fetchCourseData();
  }, [courseId, enrollmentId]);

  useEffect(() => {
    // Auto-save progress every 10 seconds
    const interval = setInterval(() => {
      if (currentLesson && currentTime > 0 && duration > 0) {
        saveProgress();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentLesson, currentTime, duration]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details using your API instance
      const response = await API.get(`/courses/${courseId}`);
      
      if (response.data && response.data.course) {
        const courseData = response.data.course;
        setCourse(courseData);
        
        // Extract all lessons from modules
        const allLessons = [];
        courseData.modules?.forEach(module => {
          module.lessons?.forEach(lesson => {
            allLessons.push({
              ...lesson,
              moduleId: module.id,
              moduleTitle: module.title
            });
          });
        });
        setLessons(allLessons);
        
        // Set first lesson as current if not specified
        if (allLessons.length > 0 && !currentLesson) {
          setCurrentLesson(allLessons[0]);
        }
      } else {
        setError("Course data not found in response");
      }
      
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.message || 'Failed to load course. Please try again.');
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setIsPlaying(true);
    
    // Auto-play video when lesson changes
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handlePlayPause = (playState) => {
    if (typeof playState === 'boolean') {
      // Video event: set the state directly
      setIsPlaying(playState);
    } else {
      // Button click: toggle the state and video
      if (!videoRef.current) return;

      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
    
    // Check if lesson is completed (watched 90% or more)
    if (duration > 0 && time / duration >= 0.9) {
      const isCompleted = progressData.completedLessons?.some(
        lesson => lesson.id === currentLesson?.id
      );
      
      if (!isCompleted && currentLesson) {
        markAsCompleted(currentLesson.id);
      }
    }
  };

  const saveProgress = async () => {
    if (!currentLesson || !enrollmentId) return;
    
    try {
      await updateProgress(currentLesson.id, {
        lastTime: currentTime,
        completed: duration > 0 ? currentTime / duration >= 0.9 : false
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      handleLessonSelect(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!currentLesson) return;
    
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      handleLessonSelect(lessons[currentIndex - 1]);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleFullscreenToggle = () => {
    // Fullscreen is now handled by the VideoPlayer component
    // This function is kept for backwards compatibility if needed
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Course not found</Alert>
      </Container>
    );
  }

  return (
    <CoursePlayerLayout>
      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Course Header */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            {course.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              icon={<MenuBook />}
              label={`${progressData.completedLessons?.length || 0}/${lessons.length} lessons`}
              color="primary"
              size="small"
            />
            <Chip 
              label={`${Math.round(progressData.progressPercentage || 0)}% complete`}
              variant="outlined"
              size="small"
            />
            <LinearProgress 
              variant="determinate" 
              value={progressData.progressPercentage || 0}
              sx={{ flex: 1 }}
            />
          </Box>
        </Paper>

        {/* Video Player Container */}
        <Paper elevation={3} sx={{ mb: 2, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
            <VideoPlayer
              ref={videoRef}
              src={currentLesson?.contentUrl}
              type={currentLesson?.contentType || 'VIDEO'}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              playbackRate={playbackRate}
              onPlayPause={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={setDuration}
              onEnded={handleNextLesson}
              onFullscreen={handleFullscreenToggle}
              onVolumeChange={handleVolumeChange}
              onPlaybackRateChange={handlePlaybackRateChange}
              onNext={handleNextLesson}
              onPrevious={handlePrevLesson}
            />
          </Box>
        </Paper>

        {/* Lesson Info */}
        {currentLesson && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {currentLesson.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Module: {currentLesson.moduleTitle}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {currentLesson.description || 'No description available.'}
                </Typography>
              </Box>
              
              <Box sx={{ ml: 2 }}>
                {progressData.completedLessons?.some(l => l.id === currentLesson.id) ? (
                  <Chip 
                    icon={<CheckCircle />}
                    label="Completed"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<CheckCircle />}
                    onClick={() => markAsCompleted(currentLesson.id)}
                    disabled={progressLoading}
                  >
                    Mark Complete
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Sidebar - Playlist */}
      <PlaylistSidebar
        course={course}
        lessons={lessons}
        currentLesson={currentLesson}
        completedLessons={progressData.completedLessons || []}
        onSelectLesson={handleLessonSelect}
        enrollmentId={enrollmentId}
      />
    </CoursePlayerLayout>
  );
};

export default CourseLearnPage;
