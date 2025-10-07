import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { FeatureGuard } from '@/components/FeatureGuard';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { TrendingUp, AlertCircle } from 'lucide-react';

const AdvancedAnalytics = () => {
  return (
    <ResponsiveLayout
      title="Analytics Avançados"
      subtitle="Análises detalhadas do seu negócio"
      icon={TrendingUp}
    >
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
    </ResponsiveLayout>
  );
};

export default AdvancedAnalytics;