
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PlanInfoBanner } from '@/components/dashboard/PlanInfoBanner';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useSubscription } from '@/hooks/useSubscription';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isSubscribed, getCurrentPlanInfo } = useSubscription();
  const currentPlan = getCurrentPlanInfo();

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header with sidebar trigger */}
      <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
        <SidebarTrigger />
        <div className="flex-1">
          <DashboardHeader />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6">
        <PlanInfoBanner currentPlan={currentPlan} isSubscribed={isSubscribed} />
        <DashboardMetrics />
        <DashboardContent />
        {children}
      </main>
    </div>
  );
};
