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
      {/* Ícone Rosa com Transparência */}
      <img 
        src="/lovable-uploads/64261687-063a-450e-8c74-f232bf9d2a4b.png"
        alt="Plushify icon"
        className={cn(config.icon, "select-none object-contain")}
        style={{ 
          background: 'transparent',
          mixBlendMode: 'multiply'
        }}
      />
      
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