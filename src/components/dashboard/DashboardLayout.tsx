
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PlanInfoBanner } from '@/components/dashboard/PlanInfoBanner';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      {/* Header - mais compacto */}
      <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-2">
        <div className="flex-1">
          <DashboardHeader />
        </div>
      </header>

      {/* Main content com espaçamento reduzido */}
      <main className="flex-1 p-4 space-y-4 bg-background">
        <PlanInfoBanner />
        <DashboardContent />
        {children}
      </main>
    </div>
  );
};
