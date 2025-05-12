import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { PageTransition } from '../components/animations/PageTransition';
import { CourseCard } from '../components/layout/CourseCard';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { getAllCourses, getCourseProgress, deleteCourse } from '../services/storageService';
import { Course, Progress } from '../types';

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressData, setProgressData] = useState<Record<string, Progress>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      const savedCourses = await getAllCourses();
      const normalizedCourses = savedCourses.map(course => ({
        ...course,
        lectures: Array.isArray(course.sections)
          ? course.sections.flatMap(section => section.lectures || [])
          : [],
      })) as (Course & { lectures: any[] })[];
  
      setCourses(normalizedCourses);
  
      const progress: Record<string, Progress> = {};
      for (const course of normalizedCourses) {
        const courseProgress = await getCourseProgress(course.id);
        if (courseProgress) {
          progress[course.id] = courseProgress;
        }
      }
      setProgressData(progress);
      setIsLoading(false);
    };
  
    loadCourses();
  }, []);

  const handleNavigateToAddCourse = () => {
    navigate('/');
  };

  const handleSelectCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      await deleteCourse(courseId);
      // Update the courses list and progress data
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      setProgressData(prevProgress => {
        const newProgress = { ...prevProgress };
        delete newProgress[courseId];
        return newProgress;
      });
    }
  };

  // Item animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Courses</h1>
            <p className="text-text-muted mt-1">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} in your library
            </p>
          </div>

          <Button
            variant="primary"
            startIcon={<Plus size={16} />}
            onClick={handleNavigateToAddCourse}
          >
            Add Course
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-background-accent h-12 w-12 mb-4"></div>
              <div className="h-4 bg-background-accent rounded w-24 mb-2.5"></div>
              <div className="h-3 bg-background-accent rounded w-16"></div>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <Card className="text-center p-8 my-12">
            <CardContent>
              <div className="flex flex-col items-center">
                <BookOpen className="h-16 w-16 text-text-muted mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-text-muted mb-6 max-w-md mx-auto">
                  Start by adding a YouTube playlist to transform it into a structured course with progress tracking.
                </p>
                <Button
                  variant="primary"
                  startIcon={<Plus size={16} />}
                  onClick={handleNavigateToAddCourse}
                >
                  Add Your First Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            key={courses.length} // helps re-trigger animation on change
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course) => (
              <motion.div key={course.id} variants={itemVariants}>
                <CourseCard
                  course={course}
                  progress={progressData[course.id]}
                  onClick={() => handleSelectCourse(course.id)}
                  onDelete={() => handleDeleteCourse(course.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};