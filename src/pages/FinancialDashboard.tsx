
import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, TrendingUp } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { MetricsCards } from '@/components/financial/MetricsCards';
import { FinancialCharts } from '@/components/financial/FinancialCharts';
import { FinancialAlerts } from '@/components/financial/FinancialAlerts';
import { toast } from "@/hooks/use-toast";

const FinancialDashboard = () => {
  const { 
    metrics, 
    monthlyData, 
    expensesByCategory, 
    revenueByMethod, 
    loading, 
    error, 
    refetch 
  } = useFinancialData();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dados atualizados",
      description: "Os dados financeiros foram atualizados com sucesso.",
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Relatório em desenvolvimento",
      description: "A funcionalidade de exportação será implementada em breve.",
    });
  };

  if (error) {
    return (
      <ResponsiveLayout
        title="Painel Financeiro"
        subtitle="Análise completa das suas finanças"
        icon={TrendingUp}
      >
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="Painel Financeiro"
      subtitle="Análise completa das suas finanças com gráficos e indicadores"
      icon={TrendingUp}
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button onClick={handleExportReport} size="sm">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      }
    >
      {/* Métricas principais */}
      {metrics && (
        <MetricsCards metrics={metrics} loading={loading} />
      )}

      {/* Alertas */}
      {metrics && (
        <FinancialAlerts metrics={metrics} loading={loading} />
      )}

      {/* Gráficos */}
      <FinancialCharts 
        monthlyData={monthlyData}
        expensesByCategory={expensesByCategory}
        revenueByMethod={revenueByMethod}
        loading={loading}
      />
    </ResponsiveLayout>
  );
};

export default FinancialDashboard;
