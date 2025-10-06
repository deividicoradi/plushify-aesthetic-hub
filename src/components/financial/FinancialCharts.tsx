
import React from 'react';
import { MonthlyFinancialData, CategoryData } from '@/hooks/useFinancialData';
import { CashFlowChart } from './charts/CashFlowChart';
import { RevenueExpensesChart } from './charts/RevenueExpensesChart';
import { CategoryPieChart } from './charts/CategoryPieChart';
import { CashFlowForecastChart } from './charts/CashFlowForecastChart';
import { LoadingCharts } from './charts/LoadingCharts';

interface FinancialChartsProps {
  monthlyData: MonthlyFinancialData[];
  expensesByCategory: CategoryData[];
  revenueByMethod: CategoryData[];
  loading?: boolean;
}

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "hsl(var(--chart-1))",
  },
  despesas: {
    label: "Despesas", 
    color: "hsl(var(--chart-2))",
  },
  saldoLiquido: {
    label: "Saldo Líquido",
    color: "hsl(var(--chart-3))",
  },
};

export const FinancialCharts = ({ 
  monthlyData, 
  expensesByCategory, 
  revenueByMethod, 
  loading = false 
}: FinancialChartsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return <LoadingCharts />;
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Fluxo de Caixa Mensal */}
      <CashFlowChart 
        data={monthlyData}
        formatCurrency={formatCurrency}
        chartConfig={chartConfig}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Receitas vs Despesas */}
        <RevenueExpensesChart 
          data={monthlyData}
          formatCurrency={formatCurrency}
          chartConfig={chartConfig}
        />

        {/* Despesas por Categoria */}
        <CategoryPieChart 
          data={expensesByCategory}
          title="Despesas por Categoria"
          formatCurrency={formatCurrency}
        />

        {/* Receitas por Método de Pagamento */}
        <CategoryPieChart 
          data={revenueByMethod}
          title="Receitas por Método"
          formatCurrency={formatCurrency}
        />

        {/* Previsão de Fluxo de Caixa */}
        <CashFlowForecastChart 
          data={monthlyData}
          formatCurrency={formatCurrency}
          chartConfig={chartConfig}
        />
      </div>
    </div>
  );
};
