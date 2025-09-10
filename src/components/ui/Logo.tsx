import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    icon: 'h-7 w-7',
    text: 'text-base'
  },
  md: {
    icon: 'h-9 w-9', 
    text: 'text-xl'
  },
  lg: {
    icon: 'h-12 w-12',
    text: 'text-2xl'
  },
  xl: {
    icon: 'h-16 w-16',
    text: 'text-3xl'
  }
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className 
}) => {
  const config = sizeConfig[size];
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Novo Ícone da Marca */}
      <div
        className={cn(
          "grid place-items-center rounded-xl",
          "bg-[hsl(var(--primary)/0.08)] ring-1 ring-[hsl(var(--primary)/0.2)]",
          config.icon
        )}
        role="img"
        aria-label="Plushify brand mark"
      >
        <svg viewBox="0 0 24 24" className="w-3/4 h-3/4" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="plushifyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent, var(--primary)))" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9" stroke="url(#plushifyGradient)" strokeWidth="1.5" fill="none" opacity="0.35" />
          <path d="M12 4a8 8 0 100 16c2.9 0 5.25-2.35 5.25-5.25S15.9 9.5 13 9.5h-3" stroke="url(#plushifyGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      {/* Texto da Marca */}
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] bg-clip-text text-transparent",
          "tracking-tight",
          config.text
        )}>
          Plushify
        </span>
      )}
    </div>
  );
};