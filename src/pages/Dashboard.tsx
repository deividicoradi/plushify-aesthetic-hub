
import React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <DashboardLayout>
          <div className="space-y-4">
            {/* Dashboard content is handled by DashboardLayout components */}
          </div>
        </DashboardLayout>
      </SidebarInset>
    </div>
  );
};

export default Dashboard;
