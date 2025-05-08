import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Calendar, TrendingUp } from 'lucide-react';
import { PageTransition } from '../components/animations/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressChart } from '../components/charts/ProgressChart';
import { formatDuration } from '../utils/formatters';
import { getAllCourses, getCourseProgress } from '../services/storageService';
import { Course, DailyProgressStats } from '../types';

export const ProgressPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCompletedLectures, setTotalCompletedLectures] = useState(0);
  const [totalWatchedTime, setTotalWatchedTime] = useState(0);
  const [totalRemainingLectures, setTotalRemainingLectures] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgressStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load all courses and compute progress statistics
    const loadCourses = () => {
      const savedCourses = getAllCourses();
      setCourses(savedCourses);
      
      let completedLectures = 0;
      let watchedTime = 0;
      let remainingLectures = 0;
      const dailyProgressMap: Record<string, DailyProgressStats> = {};
      
      savedCourses.forEach(course => {
        const progress = getCourseProgress(course.id);
        
        if (progress) {
          // Add completed lectures
          completedLectures += progress.completedLectures.length;
          
          // Calculate remaining lectures
          remainingLectures += course.totalLectures - progress.completedLectures.length;
          
          // Aggregate daily progress data
          Object.values(progress.dailyProgress).forEach(dayData => {
            if (!dailyProgressMap[dayData.date]) {
              dailyProgressMap[dayData.date] = {
                date: dayData.date,
                completedCount: 0,
                minutesWatched: 0
              };
            }
            
            dailyProgressMap[dayData.date].completedCount += dayData.completedCount;
            dailyProgressMap[dayData.date].minutesWatched += dayData.minutesWatched;
            
            // Add to total watched time (convert minutes to seconds for consistency)
            watchedTime += dayData.minutesWatched * 60;
          });
        }
      });
      
      setTotalCompletedLectures(completedLectures);
      setTotalWatchedTime(watchedTime);
      setTotalRemainingLectures(remainingLectures);
      
      // Process weekly progress data (last 7 days)
      const last7Days = getLast7Days();
      const weeklyData: DailyProgressStats[] = last7Days.map(date => {
        return dailyProgressMap[date] || {
          date,
          completedCount: 0,
          minutesWatched: 0
        };
      });
      
      setWeeklyProgress(weeklyData);
      setIsLoading(false);
    };
    
    loadCourses();
  }, []);
  
  // Helper function to get the last 7 days as YYYY-MM-DD strings
  const getLast7Days = () => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-background-accent h-12 w-12 mb-4"></div>
          <div className="h-4 bg-background-accent rounded w-24 mb-2.5"></div>
          <div className="h-3 bg-background-accent rounded w-16"></div>
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold mb-2">Your Learning Progress</h1>
          <p className="text-text-muted mb-8">
            Track your learning journey across all courses
          </p>
        </motion.div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="mr-4 bg-accent-primary/10 p-3 rounded-full text-accent-primary">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Completed Lectures</p>
                    <h3 className="text-2xl font-bold mt-1">{totalCompletedLectures}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="mr-4 bg-accent-secondary/10 p-3 rounded-full text-accent-secondary">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Remaining Lectures</p>
                    <h3 className="text-2xl font-bold mt-1">{totalRemainingLectures}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="mr-4 bg-accent-tertiary/10 p-3 rounded-full text-accent-tertiary">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Total Watch Time</p>
                    <h3 className="text-2xl font-bold mt-1">{formatDuration(totalWatchedTime)}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="mr-4 bg-accent-primary/10 p-3 rounded-full text-accent-primary">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Active Courses</p>
                    <h3 className="text-2xl font-bold mt-1">{courses.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Charts */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={weeklyProgress} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};