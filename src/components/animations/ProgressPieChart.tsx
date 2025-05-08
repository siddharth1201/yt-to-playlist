import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ProgressPieChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ProgressPieChart: React.FC<ProgressPieChartProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  className = ''
}) => {
  const progressRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  
  // Calculate SVG parameters
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const displayPercentage = Math.min(100, Math.max(0, percentage));
  
  useEffect(() => {
    if (progressRef.current && textRef.current) {
      // Start with 0% progress
      gsap.set(progressRef.current, {
        strokeDasharray: circumference,
        strokeDashoffset: circumference
      });
      
      gsap.set(textRef.current, {
        textContent: '0%'
      });
      
      // Animate to the actual percentage
      gsap.to(progressRef.current, {
        strokeDashoffset: circumference - (circumference * displayPercentage) / 100,
        duration: 1.5,
        ease: 'power2.out'
      });
      
      // Animate the percentage text
      gsap.to(textRef.current, {
        textContent: `${Math.round(displayPercentage)}%`,
        duration: 1.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        onUpdate: () => {
          if (textRef.current) {
            textRef.current.textContent = `${Math.round(gsap.getProperty(textRef.current, 'textContent') as number)}%`;
          }
        }
      });
    }
  }, [percentage, circumference, displayPercentage]);
  
  return (
    <svg width={size} height={size} className={`transform -rotate-90 ${className}`}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
      />
      
      {/* Progress circle */}
      <circle
        ref={progressRef}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-accent-primary"
      />
      
      {/* Percentage text */}
      <text
        ref={textRef}
        x={center}
        y={center}
        dy=".3em"
        textAnchor="middle"
        className="text-text-primary font-bold text-xl fill-current transform rotate-90"
      >
        0%
      </text>
    </svg>
  );
};