
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CreditCard, Target } from 'lucide-react';
import { FinancialMetrics } from '@/hooks/useFinancialData';

interface MetricsCardsProps {
  metrics: FinancialMetrics;
  loading?: boolean;
}

export const MetricsCards = ({ metrics, loading = false }: MetricsCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse bg-card border-border">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const GrowthIconReceitas = getGrowthIcon(metrics.crescimentoReceitas);
  const GrowthIconDespesas = getGrowthIcon(metrics.crescimentoDespesas);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Saldo Líquido */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Saldo Líquido</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(metrics.saldoLiquido)}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Receitas - Despesas
          </p>
        </CardContent>
      </Card>

      {/* Total Receitas */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Receitas</CardTitle>
          <GrowthIconReceitas className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(metrics.totalReceitas)}
          </div>
          <p className={`text-xs mt-2 ${getGrowthColor(metrics.crescimentoReceitas)}`}>
            {formatPercentage(metrics.crescimentoReceitas)} vs mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Total Despesas */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Total Despesas</CardTitle>
          <GrowthIconDespesas className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {formatCurrency(metrics.totalDespesas)}
          </div>
          <p className={`text-xs mt-2 ${getGrowthColor(-metrics.crescimentoDespesas)}`}>
            {formatPercentage(metrics.crescimentoDespesas)} vs mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Parcelas Vencidas */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Parcelas Vencidas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {metrics.parcelasVencidas}
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
            {metrics.parcelasPendentes} parcelas pendentes
          </p>
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Ticket Médio</CardTitle>
          <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(metrics.ticketMedio)}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
            Por pagamento
          </p>
        </CardContent>
      </Card>

      {/* Receitas Mês Atual */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">Receitas do Mês</CardTitle>
          <CreditCard className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">
            {formatCurrency(metrics.receitasMesAtual)}
          </div>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
            Mês atual
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
