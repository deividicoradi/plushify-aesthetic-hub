import React from 'react';
import { cn } from '@/lib/utils';
import logoHorizontal from '@/assets/plushify-logo-horizontal.png';
import logoSquare from '@/assets/plushify-logo-square.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    img: 'h-6',
    text: 'text-lg'
  },
  md: {
    img: 'h-8',
    text: 'text-xl'
  },
  lg: {
    img: 'h-10',
    text: 'text-2xl'
  },
  xl: {
    img: 'h-16',
    text: 'text-3xl'
  }
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className 
}) => {
  const config = sizeConfig[size];
  const imageSrc = size === 'sm' ? logoSquare : logoHorizontal;
  const showBrandText = showText && size === 'sm';
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logotipo */}
      <img
        src={imageSrc}
        alt="Plushify logotipo"
        className={cn(config.img, "w-auto select-none")}
        loading="lazy"
        decoding="async"
      />
      
      {/* Texto da Marca */}
      {showBrandText && (
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