
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useSubscription } from '@/hooks/useSubscription';

const Dashboard = () => {
  const { isLoading } = useSubscription();

  return <DashboardLayout isLoading={isLoading} />;
};

export default Dashboard;
