import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { DailyProgressStats } from '../../types';
import { motion } from 'framer-motion';

interface ProgressChartProps {
  data: DailyProgressStats[];
  height?: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  height = 200
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [maxValue, setMaxValue] = useState(1);
  
  useEffect(() => {
    if (data.length === 0) return;
    
    // Find the maximum value for scaling
    const max = Math.max(...data.map(item => item.completedCount), 1);
    setMaxValue(max);
    
    // Animate bars on mount
    if (chartRef.current) {
      const bars = chartRef.current.querySelectorAll('.bar');
      
      gsap.from(bars, {
        scaleY: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }
  }, [data]);
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-background-secondary rounded-lg border border-background-accent p-4">
        <p className="text-text-muted">No progress data available yet</p>
      </div>
    );
  }
  
  // Format date for display (e.g., "Mon", "Tue", etc.)
  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  return (
    <div className="bg-background-secondary rounded-lg border border-background-accent p-4">
      <h3 className="text-sm font-medium mb-4 text-text-muted">Daily Completed Lectures</h3>
      
      <div 
        ref={chartRef}
        className="flex items-end justify-between h-40 gap-2"
      >
        {data.map((item, index) => {
          const percentage = (item.completedCount / maxValue) * 100;
          
          return (
            <div key={item.date} className="flex flex-col items-center flex-1">
              <motion.div 
                className="bar w-full bg-accent-primary/80 rounded-t-sm hover:bg-accent-primary transition-colors duration-200"
                style={{ 
                  height: `${percentage}%`,
                  minHeight: item.completedCount > 0 ? '4px' : '0'
                }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileHover={{ opacity: 1, y: -30 }}
                  className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-background-accent px-2 py-1 rounded text-xs whitespace-nowrap"
                >
                  {item.completedCount} lectures
                </motion.div>
              </motion.div>
              <div className="text-xs mt-2 text-text-muted">{formatDay(item.date)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};