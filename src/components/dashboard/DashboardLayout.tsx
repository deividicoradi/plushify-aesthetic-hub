
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PlanInfoBanner } from '@/components/dashboard/PlanInfoBanner';
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
      {/* Header with sidebar trigger - mais compacto */}
      <header className="flex items-center gap-4 border-b bg-background px-4 py-2">
        <SidebarTrigger />
        <div className="flex-1">
          <DashboardHeader />
        </div>
      </header>

      {/* Main content com espaçamento reduzido */}
      <main className="flex-1 p-4 space-y-4">
        <PlanInfoBanner currentPlan={currentPlan} isSubscribed={isSubscribed} />
        <DashboardContent />
        {children}
      </main>
    </div>
  );
};
