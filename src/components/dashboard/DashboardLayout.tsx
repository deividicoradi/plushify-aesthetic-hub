
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PlanInfoBanner } from '@/components/dashboard/PlanInfoBanner';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useSubscription } from '@/hooks/useSubscription';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isSubscribed, getCurrentPlanInfo } = useSubscription();
  const currentPlan = getCurrentPlanInfo();

  return (
    <div className="space-y-4">
      <DashboardHeader />
      <PlanInfoBanner currentPlan={currentPlan} isSubscribed={isSubscribed} />
      <DashboardMetrics />
      <DashboardContent />
      {children}
    </div>
  );
};
