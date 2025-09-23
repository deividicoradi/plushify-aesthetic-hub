import { useState, useEffect } from 'react';

export interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  width: number;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  large: 1536
} as const;

export function useResponsive(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    width: 0
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      
      setState(prev => {
        // FIX: só atualizar se realmente mudou para evitar re-renders desnecessários
        const newState = {
          isMobile: width < BREAKPOINTS.mobile,
          isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
          isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
          isLarge: width >= BREAKPOINTS.desktop,
          width
        };
        
        // Comparar com estado anterior
        if (prev.isMobile === newState.isMobile && 
            prev.isTablet === newState.isTablet && 
            prev.isDesktop === newState.isDesktop && 
            prev.isLarge === newState.isLarge && 
            Math.abs(prev.width - newState.width) < 10) {
          return prev; // Não há mudança significativa
        }
        
        return newState;
      });
    };

    // Initial check
    updateBreakpoints();

    // Listen for resize events with throttling
    let resizeTimeout: NodeJS.Timeout;
    const throttledUpdate = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateBreakpoints, 100); // FIX: throttle de 100ms
    };

    window.addEventListener('resize', throttledUpdate);
    
    return () => {
      window.removeEventListener('resize', throttledUpdate);
      clearTimeout(resizeTimeout);
    };
  }, []); // FIX: array vazio correto

  return state;
}