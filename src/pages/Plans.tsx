
import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useSubscription } from '@/hooks/useSubscription';
import { PlansPage } from '@/components/plans/PlansPage';

const Plans = () => {
  const { loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <main className="ml-64 min-h-screen">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Planos</h1>
            <p className="text-sm text-muted-foreground mt-1">Escolha o plano ideal para seu negócio</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <PlansPage />
        </div>
      </main>
    </div>
  );
};

export default Plans;
