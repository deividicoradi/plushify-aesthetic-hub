import React, { useEffect } from 'react';

export const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Performance monitoring
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('🚀 Performance Metrics:', {
            DOMContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            LoadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            FirstPaint: navEntry.responseEnd - navEntry.fetchStart,
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'measure'] });
    
    return () => observer.disconnect();
  }, []);

  return null;
};