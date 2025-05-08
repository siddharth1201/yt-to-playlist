import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  showLabel?: boolean;
  className?: string;
  labelClassName?: string;
  barClassName?: string;
  progressClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 8,
  showLabel = true,
  className = '',
  labelClassName = '',
  barClassName = '',
  progressClassName = ''
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${percentage}%`,
        duration: 1,
        ease: 'power2.out'
      });
    }
  }, [percentage]);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className={`flex justify-between mb-1 text-sm ${labelClassName}`}>
          <span>{`${Math.round(percentage)}%`}</span>
          <span>{`${value}/${max}`}</span>
        </div>
      )}
      <div 
        className={`w-full rounded-full bg-background-accent overflow-hidden ${barClassName}`} 
        style={{ height: `${height}px` }}
      >
        <div
          ref={progressRef}
          className={`h-full rounded-full bg-accent-primary ${progressClassName}`}
          style={{ width: '0%' }}
        ></div>
      </div>
    </div>
  );
};