
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { TodayOverview } from '@/components/dashboard/TodayOverview';

const Dashboard = () => {
  return (
    <ResponsiveLayout
      title="Dashboard"
      subtitle="Visão geral do seu negócio"
      icon={BarChart3}
    >
      <TodayOverview />
      <DashboardContent />
    </ResponsiveLayout>
  );
};

export default Dashboard;
