
import React from 'react';
import { BarChart3 } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { PlanLimitsDisplay } from '@/components/dashboard/PlanLimitsDisplay';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Visão geral do seu negócio
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <PlanLimitsDisplay />
          <DashboardContent />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
