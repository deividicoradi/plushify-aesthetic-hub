import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-[9999] font-medium transition-all duration-200 focus:shadow-lg"
    >
      Pular para o conteúdo principal
    </a>
  );
};