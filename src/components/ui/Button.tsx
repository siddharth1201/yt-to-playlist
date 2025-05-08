import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary flex items-center justify-center';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-accent-primary hover:bg-accent-primary/90 text-white focus:ring-accent-primary',
    secondary: 'bg-accent-secondary hover:bg-accent-secondary/90 text-white focus:ring-accent-secondary',
    outline: 'border border-accent-primary text-accent-primary hover:bg-accent-primary/10 focus:ring-accent-primary',
    ghost: 'text-accent-primary hover:bg-accent-primary/10 focus:ring-accent-primary',
    danger: 'bg-error-DEFAULT hover:bg-error-dark text-white focus:ring-error-DEFAULT'
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };
  
  // Loading and disabled styles
  const stateStyles = (isLoading || disabled) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';
  
  // Full width style
  const widthStyle = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      type="button"
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${stateStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : startIcon ? (
        <span className="mr-2">{startIcon}</span>
      ) : null}
      
      {children}
      
      {!isLoading && endIcon ? (
        <span className="ml-2">{endIcon}</span>
      ) : null}
    </motion.button>
  );
};