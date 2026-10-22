import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'white' | 'glow' | 'secondary';
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
  // Supabase Pill Button System: 9999px radius, tight -0.007em tracking, flat zero-shadow elevation
  const baseStyles = "inline-flex items-center justify-center rounded-full transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#3ecf8e] active:scale-[0.99] tracking-[-0.007em] cursor-pointer select-none";
  
  const variants = {
    // Pill Primary Button: #3ecf8e fill, #fafafa text, 1px solid #3ecf8e (hover: border #1f4b37, fill #00c573)
    primary: "bg-[#3ecf8e] hover:bg-[#00c573] text-[#fafafa] font-medium border border-[#3ecf8e] hover:border-[#1f4b37]",
    
    // Pill Ghost Button: transparent, 1px solid #393939, #fafafa text (hover: border #4d4d4d, bg rgba(255,255,255,0.04))
    ghost: "bg-transparent hover:bg-white/[0.04] text-[#fafafa] font-normal border border-[#393939] hover:border-[#4d4d4d]",
    
    // Pill Outline Button: 1px solid #2e2e2e, #b4b4b4 text (hover: border #4d4d4d, text #fafafa)
    outline: "bg-transparent hover:bg-[#181818] text-[#b4b4b4] hover:text-[#fafafa] font-normal border border-[#2e2e2e] hover:border-[#4d4d4d]",
    
    // Secondary elevated surface
    secondary: "bg-[#242424] hover:bg-[#2e2e2e] text-[#fafafa] font-medium border border-[#2e2e2e]",

    // Glow alias mapped cleanly to phosphor green without gaudy radial blobs
    glow: "bg-[#3ecf8e] hover:bg-[#00c573] text-[#fafafa] font-medium border border-[#3ecf8e] hover:border-[#1f4b37]",
    
    // Monochrome dark-surface pill
    white: "bg-[#fafafa] hover:bg-[#b4b4b4] text-[#121212] font-medium border border-[#fafafa]"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs font-medium leading-[1.43]",
    md: "px-4 py-2 text-sm font-medium leading-[1.43]",
    lg: "px-6 py-2.5 text-base font-medium leading-[1.5]"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};