import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios'; // Use your API instance
import { toast } from 'react-toastify';

const useCourseProgress = (enrollmentId) => {
  const [progressData, setProgressData] = useState({
    progressPercentage: 0,
    completedLessons: [],
    enrollment: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!enrollmentId) return;

    try {
      setIsLoading(true);
      const response = await API.get(`/enrollments/${enrollmentId}`);
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Extract completed lessons from lessonProgress
        const completedLessons = data.lessonProgress
          ?.filter(lp => lp.completed)
          .map(lp => lp.lesson || { id: lp.lessonId }) || [];

        setProgressData({
          progressPercentage: data.progress || 0,
          completedLessons,
          enrollment: data
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);

      let errorMessage = 'Failed to load progress data';

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'Please log in to view course progress';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to view this course';
        } else if (status === 404) {
          errorMessage = 'Course enrollment not found';
        } else {
          errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `Server error: ${status}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - please check your connection';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  const updateProgress = async (lessonId, data) => {
    if (!enrollmentId || !lessonId) return;

    try {
      const response = await API.put(
        `/progress/${enrollmentId}/lessons/${lessonId}`,
        data
      );

      if (response.data.success) {
        // Update local state if lesson is marked as completed
        if (data.completed) {
          setProgressData(prev => ({
            ...prev,
            completedLessons: [...prev.completedLessons, { id: lessonId }],
            progressPercentage: response.data.progress?.overallProgress || prev.progressPercentage
          }));
        }

        toast.success('Progress saved');
        return response.data;
      }
    } catch (error) {
      console.error('Error updating progress:', error);

      let errorMessage = 'Failed to save progress';

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'Please log in to update progress';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to update this progress';
        } else if (status === 404) {
          errorMessage = 'Lesson or enrollment not found';
        } else {
          errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `Server error: ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const markAsCompleted = async (lessonId) => {
    try {
      const response = await API.post(
        `/progress/${enrollmentId}/lessons/${lessonId}/complete`
      );

      if (response.data.success) {
        setProgressData(prev => ({
          ...prev,
          completedLessons: [...prev.completedLessons, { id: lessonId }],
          progressPercentage: response.data.progress?.overallProgress || prev.progressPercentage
        }));

        toast.success('Lesson marked as completed');
        return response.data;
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);

      let errorMessage = 'Failed to mark lesson as completed';

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'Please log in to mark lessons as completed';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to update this lesson';
        } else if (status === 404) {
          errorMessage = 'Lesson or enrollment not found';
        } else {
          errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `Server error: ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    if (enrollmentId) {
      fetchProgress();
    }
  }, [enrollmentId, fetchProgress]);

  return {
    progressData,
    updateProgress,
    markAsCompleted,
    isLoading,
    refetch: fetchProgress
  };
};

export default useCourseProgress;
