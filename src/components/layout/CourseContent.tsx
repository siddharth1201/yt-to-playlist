import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Play, CheckCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, Section, Lecture } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { markLectureCompleted, markLectureNotCompleted } from '../../services/storageService';

interface CourseContentProps {
  course: Course;
  completedLectures: string[];
  onSelectLecture: (lectureId: string) => void;
  currentLectureId?: string;
}

export const CourseContent: React.FC<CourseContentProps> = ({
  course,
  completedLectures,
  onSelectLecture,
  currentLectureId
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    // Initially expand the first section and the section containing the current lecture
    course.sections.reduce((acc, section, index) => {
      const hasCurrentLecture = currentLectureId && 
        section.lectures.some(lecture => lecture.id === currentLectureId);
      
      return {
        ...acc,
        [section.id]: index === 0 || hasCurrentLecture
      };
    }, {})
  );
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const toggleLectureCompletion = (
    e: React.MouseEvent,
    courseId: string,
    lectureId: string,
    isCompleted: boolean
  ) => {
    e.stopPropagation();
    
    if (isCompleted) {
      markLectureNotCompleted(courseId, lectureId);
    } else {
      markLectureCompleted(courseId, lectureId);
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden bg-background-secondary border-background-accent">
      <div className="p-4 border-b border-background-accent">
        <h3 className="font-semibold text-lg">Course Content</h3>
        <p className="text-text-muted text-sm mt-1">
          {course.sections.length} sections • {course.totalLectures} lectures • {formatDuration(course.totalDuration)} total length
        </p>
      </div>
      
      <div className="divide-y divide-background-accent">
        {course.sections.map((section) => (
          <div key={section.id} className="overflow-hidden">
            <button
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-background-accent focus:outline-none transition-colors duration-200"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center">
                {expandedSections[section.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span className="ml-2 font-medium">{section.title}</span>
              </div>
              <span className="text-sm text-text-muted">
                {section.lectures.length} lectures • {formatDuration(
                  section.lectures.reduce((total, lecture) => total + lecture.duration, 0)
                )}
              </span>
            </button>
            
            <AnimatePresence>
              {expandedSections[section.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="pl-10 pr-4 pb-3 bg-background-accent/30">
                    {section.lectures.map((lecture) => {
                      const isCompleted = completedLectures.includes(lecture.id);
                      const isActive = currentLectureId === lecture.id;
                      
                      return (
                        <div 
                          key={lecture.id}
                          className={`py-2 border-b last:border-b-0 border-background-accent/50 flex items-center justify-between cursor-pointer ${
                            isActive ? 'bg-background-accent/50' : ''
                          }`}
                          onClick={() => onSelectLecture(lecture.id)}
                        >
                          <div className="flex items-center">
                            {isActive ? (
                              <div className="text-accent-primary">
                                <Play size={16} fill="currentColor" />
                              </div>
                            ) : (
                              <button
                                onClick={(e) => toggleLectureCompletion(e, course.id, lecture.id, isCompleted)}
                                className={`transition-colors duration-200 ${
                                  isCompleted ? 'text-success-DEFAULT' : 'text-text-muted hover:text-accent-primary'
                                }`}
                              >
                                {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                              </button>
                            )}
                            <span className={`ml-2 text-sm ${
                              isActive 
                                ? 'text-accent-primary font-medium' 
                                : isCompleted 
                                  ? 'text-text-muted line-through' 
                                  : 'text-text-secondary'
                            }`}>
                              {lecture.title}
                            </span>
                          </div>
                          <span className="text-xs text-text-muted">
                            {formatDuration(lecture.duration)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};