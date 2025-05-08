import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    startIcon, 
    endIcon, 
    fullWidth = false, 
    className = '', 
    ...props 
  }, ref) => {
    // Base styles
    const baseStyles = 'bg-background-accent text-text-primary px-4 py-2 rounded-md outline-none transition-all duration-200';
    
    // Focus and error styles
    const stateStyles = error
      ? 'border-error-DEFAULT focus:border-error-DEFAULT focus:ring-1 focus:ring-error-DEFAULT'
      : 'border-background-accent focus:border-accent-primary focus:ring-1 focus:ring-accent-primary';
    
    // Width style
    const widthStyle = fullWidth ? 'w-full' : '';
    
    // Icon styles
    const hasStartIcon = startIcon ? 'pl-10' : '';
    const hasEndIcon = endIcon ? 'pr-10' : '';
    
    return (
      <div className={`flex flex-col ${widthStyle}`}>
        {label && (
          <label className="mb-1 text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
              {startIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`${baseStyles} ${stateStyles} ${hasStartIcon} ${hasEndIcon} ${widthStyle} ${className} border`}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted">
              {endIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-error-DEFAULT' : 'text-text-muted'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';