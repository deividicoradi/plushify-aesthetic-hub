
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
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
    // Aqui poderia integrar com a funcionalidade de PDF existente
    toast({
      title: "Relatório em desenvolvimento",
      description: "A funcionalidade de exportação será implementada em breve.",
    });
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen w-full">
              <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">Painel Financeiro</h1>
                </div>
              </header>
              <main className="flex-1 p-6">
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">Erro ao carregar dados: {error}</p>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
              <SidebarTrigger />
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
            <main className="flex-1 p-6 space-y-6">
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default FinancialDashboard;
