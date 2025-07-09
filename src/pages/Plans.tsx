
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlansPage } from '@/components/plans/PlansPage';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

const Plans = () => {
  const { user } = useAuth();

  // Se o usuário estiver logado, mostrar com sidebar
  if (user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardSidebar />
        <main className="ml-64 min-h-screen">
          <div className="p-6">
            <PlansPage />
          </div>
        </main>
      </div>
    );
  }

  // Se não estiver logado, mostrar layout público
  return <PlansPage />;
};

export default Plans;
