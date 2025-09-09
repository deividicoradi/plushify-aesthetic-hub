import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    icon: 'h-6 w-6',
    text: 'text-lg'
  },
  md: {
    icon: 'h-8 w-8', 
    text: 'text-xl'
  },
  lg: {
    icon: 'h-10 w-10',
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
      {/* Ícone Moderno */}
      <div className={cn(
        "relative flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-pink-500 to-pink-600",
        "shadow-lg shadow-pink-500/25",
        config.icon
      )}>
        <div className={cn(
          "absolute inset-2 rounded-full bg-white",
          "flex items-center justify-center"
        )}>
          <div className={cn(
            "w-full h-full rounded-full",
            "bg-gradient-to-br from-pink-500 to-pink-600"
          )} />
        </div>
      </div>
      
      {/* Texto da Marca */}
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent",
          "tracking-tight",
          config.text
        )}>
          Plushify
        </span>
      )}
    </div>
  );
};