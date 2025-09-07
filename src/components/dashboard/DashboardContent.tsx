
import React, { lazy } from 'react';
import { LazyLoadWrapper } from '@/components/LazyLoadWrapper';

// Lazy load do dashboard otimizado para melhor performance
const OptimizedModernDashboard = lazy(() => 
  import('@/components/dashboard/OptimizedModernDashboard').then(module => ({
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
