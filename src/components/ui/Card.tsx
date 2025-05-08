import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  elevation?: 'none' | 'subtle' | 'medium' | 'strong';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  elevation = 'medium'
}) => {
  // Base styles
  const baseStyles = 'rounded-lg bg-background-secondary overflow-hidden';
  
  // Interactive styles
  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-200 hover:translate-y-[-4px]'
    : '';
  
  // Elevation styles
  const elevationStyles = {
    none: '',
    subtle: 'shadow-subtle',
    medium: 'shadow-medium',
    strong: 'shadow-strong'
  };
  
  const cardContent = (
    <div className={`${baseStyles} ${interactiveStyles} ${elevationStyles[elevation]} ${className}`}>
      {children}
    </div>
  );
  
  // If the card is interactive and has an onClick handler, wrap it in a motion.div
  if (interactive && onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        {cardContent}
      </motion.div>
    );
  }
  
  return cardContent;
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return <div className={`p-4 border-b border-background-accent ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return <h3 className={`text-lg font-semibold text-text-primary ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return <div className={`p-4 border-t border-background-accent ${className}`}>{children}</div>;
};