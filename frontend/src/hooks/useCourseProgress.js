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
      toast.error(error.response?.data?.message || 'Failed to load progress data');
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
      toast.error(error.response?.data?.message || 'Failed to save progress');
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
      toast.error(error.response?.data?.message || 'Failed to mark lesson as completed');
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