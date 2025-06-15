
import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6">
          <DashboardContent />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
