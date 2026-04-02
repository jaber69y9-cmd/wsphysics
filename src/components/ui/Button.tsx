import React from 'react';
import { cn } from './GlassCard';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "glass-btn",
      secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-800/30",
      outline: "border-2 border-orange-500 text-orange-600 hover:bg-orange-50",
      ghost: "hover:bg-orange-100 text-slate-700 hover:text-orange-600",
      danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
