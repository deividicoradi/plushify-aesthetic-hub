
import React, { lazy } from 'react';
import { LazyLoadWrapper } from '@/components/LazyLoadWrapper';

// Lazy load with preload strategy for better performance
const OptimizedModernDashboard = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ '@/components/dashboard/OptimizedModernDashboard').then(module => ({
    default: module.OptimizedModernDashboard
  }))
);

export const DashboardContent = () => {
  return (
    <div className="space-y-6 relative">
      {/* Dashboard Principal Moderno com Lazy Loading */}
      <LazyLoadWrapper>
        <OptimizedModernDashboard />
      </LazyLoadWrapper>
    </div>
  );
};
