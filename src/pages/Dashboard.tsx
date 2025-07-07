
import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { PlanLimitsDisplay } from '@/components/dashboard/PlanLimitsDisplay';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 space-y-6">
          <PlanLimitsDisplay />
          <DashboardContent />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
