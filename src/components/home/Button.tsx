import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'white' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black dark:focus:ring-offset-black";
  
  const variants = {
    // Primary: Emerald green in Light mode, White in Dark mode
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-transparent shadow-lg shadow-emerald-200 dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]",
    
    glow: "bg-gradient-to-r from-green-400 to-emerald-500 dark:from-neon-green dark:to-neon-emerald text-white dark:text-black border border-transparent hover:opacity-90 shadow-[0_0_20px_rgba(74,222,128,0.5)]",
    
    outline: "bg-transparent border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-white dark:hover:bg-white/10 dark:hover:border-white",
    
    ghost: "bg-transparent text-gray-600 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5",
    
    white: "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 border border-transparent shadow-md"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};