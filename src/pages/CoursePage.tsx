import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { PageTransition } from '../components/animations/PageTransition';
import { Button } from '../components/ui/Button';
import { CourseContent } from '../components/layout/CourseContent';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProgressPieChart } from '../components/animations/ProgressPieChart';
import { getCourseById, getCourseProgress, markLectureCompleted, updateLastWatched } from '../services/storageService';
import { useProgress } from '../hooks/useProgress';
import { Course, Lecture } from '../types';
import { formatDuration } from '../utils/formatters';

export const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    progress, 
    completionPercentage, 
    completedLecturesCount, 
    remainingLecturesCount 
  } = useProgress(course);
  
  useEffect(() => {
    if (!courseId) {
      navigate('/courses');
      return;
    }
    
    // Load course data
    const loadCourse = async () => {
      const courseData = await getCourseById(courseId);
      
      if (!courseData) {
        navigate('/courses');
        return;
      }
      
      setCourse(courseData);
      
      // Get progress data
      const progressData = await getCourseProgress(courseId);
      
      // Determine which lecture to show
      let lectureToShow: Lecture | null = null;
      
      if (progressData?.lastWatched?.lectureId) {
        // Find the last watched lecture
        for (const section of courseData.sections) {
          const foundLecture = section.lectures.find(
            lecture => lecture.id === progressData.lastWatched.lectureId
          );
          
          if (foundLecture) {
            lectureToShow = foundLecture;
            break;
          }
        }
      }
      
      // If no last watched lecture, show the first one
      if (!lectureToShow && courseData.sections.length > 0 && courseData.sections[0].lectures.length > 0) {
        lectureToShow = courseData.sections[0].lectures[0];
      }
      
      setCurrentLecture(lectureToShow);
      setIsLoading(false);
    };
    
    loadCourse();
  }, [courseId, navigate]);
  
  const handleSelectLecture = (lectureId: string) => {
    if (!course) return;
    
    // Find the lecture in the course
    let selectedLecture: Lecture | null = null;
    
    for (const section of course.sections) {
      const foundLecture = section.lectures.find(lecture => lecture.id === lectureId);
      
      if (foundLecture) {
        selectedLecture = foundLecture;
        break;
      }
    }
    
    if (selectedLecture) {
      setCurrentLecture(selectedLecture);
      
      // Update last watched
      if (courseId) {
        updateLastWatched(courseId, selectedLecture.id, 0);
      }
    }
  };
  
  const handleVideoStateChange = (event: any) => {
    // Update the last watched position every 5 seconds
    if (event.data === 1 && courseId && currentLecture) { // 1 = playing
      const interval = setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        updateLastWatched(courseId, currentLecture.id, currentTime);
      }, 5000);
      
      // Store the interval ID so we can clear it when the video is paused/ended
      (event.target as any).intervalId = interval;
    } else {
      // Clear the interval when the video is paused/ended
      clearInterval((event.target as any).intervalId);
    }
  };
  
  const handleVideoEnd = () => {
    if (!courseId || !currentLecture) return;
    
    // Mark current lecture as completed
    markLectureCompleted(courseId, currentLecture.id);
    
    // Find the next lecture to play
    if (course) {
      let foundCurrentSection = false;
      let nextLecture: Lecture | null = null;
      
      for (const section of course.sections) {
        const currentLectureIndex = section.lectures.findIndex(lecture => lecture.id === currentLecture.id);
        
        if (currentLectureIndex !== -1) {
          foundCurrentSection = true;
          
          // Check if there's a next lecture in this section
          if (currentLectureIndex < section.lectures.length - 1) {
            nextLecture = section.lectures[currentLectureIndex + 1];
            break;
          }
        } else if (foundCurrentSection) {
          // We're in the next section after the one with current lecture
          if (section.lectures.length > 0) {
            nextLecture = section.lectures[0];
            break;
          }
        }
      }
      
      // If we found a next lecture, play it
      if (nextLecture) {
        setCurrentLecture(nextLecture);
        updateLastWatched(courseId, nextLecture.id, 0);
      }
    }
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
  
  if (!course || !currentLecture) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Course not found</p>
        <Button
          variant="primary"
          onClick={() => navigate('/courses')}
          className="mt-4"
        >
          Back to Courses
        </Button>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/courses')}
            startIcon={<ArrowLeft size={16} />}
            className="mr-4"
          >
            Back to Courses
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="text-text-muted mt-1 text-sm">
              {course.totalLectures} lectures • {formatDuration(course.totalDuration)} total length
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-black overflow-hidden rounded-lg">
              <YouTube
                videoId={currentLecture.videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                    start: Math.floor(progress?.lastWatched?.timestamp || 0)
                  }
                }}
                onStateChange={handleVideoStateChange}
                onEnd={handleVideoEnd}
                className="w-full h-full"
              />
            </div>
            
            {/* Lecture Title & Info */}
            <div className="bg-background-secondary p-4 rounded-lg border border-background-accent">
              <h2 className="text-lg font-medium mb-2">{currentLecture.title}</h2>
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-sm">
                  Lecture duration: {formatDuration(currentLecture.duration)}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  startIcon={<CheckCircle size={16} />}
                  onClick={() => {
                    if (courseId) {
                      markLectureCompleted(courseId, currentLecture.id);
                    }
                  }}
                >
                  Mark as Completed
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-background-secondary p-4 rounded-lg border border-background-accent"
            >
              <h3 className="text-lg font-medium mb-4">Your Progress</h3>
              
              <div className="flex justify-center mb-4">
                <ProgressPieChart percentage={completionPercentage} />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Completed:</span>
                  <span className="font-medium">{completedLecturesCount} lectures</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Remaining:</span>
                  <span className="font-medium">{remainingLecturesCount} lectures</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total:</span>
                  <span className="font-medium">{course.totalLectures} lectures</span>
                </div>
              </div>
              
              <div className="mt-4">
                <ProgressBar 
                  value={completedLecturesCount} 
                  max={course.totalLectures} 
                  height={6}
                  showLabel={false}
                />
              </div>
            </motion.div>
            
            {/* Course Content */}
            <CourseContent 
              course={course}
              completedLectures={progress?.completedLectures || []}
              onSelectLecture={handleSelectLecture}
              currentLectureId={currentLecture.id}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};