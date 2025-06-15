
import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <DashboardSidebar />
      <div className="flex-1 bg-background">
        <div className="p-4">
          <DashboardContent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
