import { useState, useEffect } from 'react';
import { Course, Progress, DailyProgressStats } from '../types';
import { getCourseProgress } from '../services/storageService';

interface UseProgressReturn {
  progress: Progress | null;
  completionPercentage: number;
  completedLecturesCount: number;
  remainingLecturesCount: number;
  dailyStats: DailyProgressStats[];
  lastWeekStats: DailyProgressStats[];
  isLoading: boolean;
}

export const useProgress = (course: Course | null): UseProgressReturn => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [completedLecturesCount, setCompletedLecturesCount] = useState<number>(0);
  const [remainingLecturesCount, setRemainingLecturesCount] = useState<number>(0);
  const [dailyStats, setDailyStats] = useState<DailyProgressStats[]>([]);
  const [lastWeekStats, setLastWeekStats] = useState<DailyProgressStats[]>([]);
  
  useEffect(() => {
    if (!course) {
      setIsLoading(false);
      return;
    }
    
    const fetchProgress = async () => {
      setIsLoading(true);
      const progressData = await getCourseProgress(course.id);
      setProgress(progressData);
      
      if (progressData) {
        // Calculate completion percentage
        const completedCount = progressData.completedLectures.length;
        const totalCount = course.totalLectures;
        setCompletionPercentage(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
        setCompletedLecturesCount(completedCount);
        setRemainingLecturesCount(totalCount - completedCount);
        
        // Process daily progress data
        const dailyProgressEntries = Object.values(progressData.dailyProgress);
        
        // Sort by date (newest first)
        const sortedEntries = dailyProgressEntries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setDailyStats(sortedEntries);
        
        // Get last 7 days of data
        setLastWeekStats(sortedEntries.slice(0, 7).reverse());
      }
      
      setIsLoading(false);
    };
    
    fetchProgress();
  }, [course]);
  
  return {
    progress,
    completionPercentage,
    completedLecturesCount,
    remainingLecturesCount,
    dailyStats,
    lastWeekStats,
    isLoading
  };
};