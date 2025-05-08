import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Course, Progress } from '../../types';
import { calculateTotalDuration } from '../../utils/formatters';

interface CourseCardProps {
  course: Course;
  progress?: Progress;
  onClick: () => void;
  onDelete: (event: React.MouseEvent) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  progress, 
  onClick, 
  onDelete 
}) => {
  // Calculate completion percentage
  const completedLectures = progress?.completedLectures || [];
  const completionPercentage = 
    (course.totalLectures > 0) 
      ? (completedLectures.length / course.totalLectures) * 100 
      : 0;
  
  return (
    <Card
      interactive
      elevation="medium"
      onClick={onClick}
      className="h-full relative group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        className="absolute top-1 right-1 p-1 rounded-full bg-black/40 backdrop-blur-sm hover:bg-error-DEFAULT/90 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 shadow-lg border border-white/10"
        title="Delete course"
      >
        <Trash2 size={16} className="text-white" />
      </button>

      <div className="relative z-10">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="bg-accent-primary rounded-full p-3 text-white shadow-md"
          >
            <Play className="w-6 h-6" fill="white" />
          </motion.div>
        </div>
      </div>
      
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
        
        <p className="text-sm text-text-secondary line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-text-muted">
          <div className="flex items-center">
            <BookOpen size={16} className="mr-1" />
            <span>{course.totalLectures} lectures</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{calculateTotalDuration(course.totalDuration)}</span>
          </div>
        </div>
        
        <div className="pt-2">
          <ProgressBar 
            value={completedLectures.length} 
            max={course.totalLectures}
            showLabel={true}
            labelClassName="text-xs"
            barClassName="bg-background-accent/50"
            progressClassName="bg-accent-primary"
          />
          <p className="text-xs text-text-muted mt-1">
            {completedLectures.length} of {course.totalLectures} lectures completed ({Math.round(completionPercentage)}%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};