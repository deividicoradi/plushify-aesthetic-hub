import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { FeatureGuard } from '@/components/FeatureGuard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { TrendingUp, AlertCircle } from 'lucide-react';

const AdvancedAnalytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics Avançados</h1>
              <p className="text-sm text-muted-foreground">
                Análises detalhadas do seu negócio
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <FeatureGuard 
            planFeature="hasAdvancedAnalytics"
            fallback={
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Analytics Avançados
                </h2>
                <p className="text-muted-foreground">
                  Esta funcionalidade está disponível apenas para assinantes Premium.
                </p>
              </div>
            }
          >
            <AnalyticsDashboard />
          </FeatureGuard>
        </main>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;