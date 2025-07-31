
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { PlanLimitsDisplay } from '@/components/dashboard/PlanLimitsDisplay';
import { WhatsAppFloatingChat } from '@/components/whatsapp/WhatsAppFloatingChat';

const Dashboard = () => {
  return (
    <>
      <ResponsiveLayout
        title="Dashboard"
        subtitle="Visão geral do seu negócio"
        icon={BarChart3}
      >
        <PlanLimitsDisplay />
        <DashboardContent />
      </ResponsiveLayout>
      <WhatsAppFloatingChat />
    </>
  );
};

export default Dashboard;
