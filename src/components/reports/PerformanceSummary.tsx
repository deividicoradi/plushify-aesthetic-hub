
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureGuard } from '@/components/FeatureGuard';
import { ReportsMetrics } from '@/hooks/useReportsData';

interface PerformanceSummaryProps {
  metrics: ReportsMetrics | null;
}

export const PerformanceSummary = ({ metrics }: PerformanceSummaryProps) => {
  return (
    <FeatureGuard 
      planFeature="hasAdvancedAnalytics"
      showUpgradePrompt={true}
    >
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Resumo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {metrics?.clientsGrowth ? (metrics.clientsGrowth > 0 ? '+' : '') + metrics.clientsGrowth.toFixed(1) : '0'}%
              </div>
              <p className="text-sm text-muted-foreground">Crescimento de Clientes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {metrics?.revenueGrowth ? (metrics.revenueGrowth > 0 ? '+' : '') + metrics.revenueGrowth.toFixed(1) : '0'}%
              </div>
              <p className="text-sm text-muted-foreground">Crescimento de Receita</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {metrics?.appointmentsGrowth ? (metrics.appointmentsGrowth > 0 ? '+' : '') + metrics.appointmentsGrowth.toFixed(1) : '0'}%
              </div>
              <p className="text-sm text-muted-foreground">Crescimento de Agendamentos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGuard>
  );
};
