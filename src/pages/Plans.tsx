
import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useSubscription } from '@/hooks/useSubscription';
import { PlansPage } from '@/components/plans/PlansPage';

const Plans = () => {
  const { loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Planos</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 bg-background overflow-y-auto">
          <PlansPage />
        </main>
      </div>
    </div>
  );
};

export default Plans;
