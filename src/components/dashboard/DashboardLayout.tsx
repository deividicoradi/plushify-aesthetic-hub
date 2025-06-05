
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PlanInfoBanner } from '@/components/dashboard/PlanInfoBanner';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useSubscription } from '@/hooks/useSubscription';

interface DashboardLayoutProps {
  isLoading: boolean;
}

export const DashboardLayout = ({ isLoading }: DashboardLayoutProps) => {
  const { isSubscribed, getCurrentPlanInfo } = useSubscription();
  const currentPlan = getCurrentPlanInfo();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader />
        <div className="text-center py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DashboardHeader />
      <PlanInfoBanner currentPlan={currentPlan} isSubscribed={isSubscribed} />
      <DashboardMetrics />
      <DashboardContent />
    </div>
  );
};
