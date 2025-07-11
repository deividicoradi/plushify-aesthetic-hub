
import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
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
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="ml-64 min-h-screen flex flex-col bg-background">
          <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Painel Financeiro</h1>
            </div>
          </header>
          <main className="flex-1 p-6 bg-background">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Erro ao carregar dados: {error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-64 min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Painel Financeiro
            </h1>
            <p className="text-muted-foreground text-sm">
              Análise completa das suas finanças com gráficos e indicadores
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleExportReport} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 space-y-6 bg-background">
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
        </main>
      </div>
    </div>
  );
};

export default FinancialDashboard;
