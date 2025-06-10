
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { FinancialMetrics } from '@/hooks/useFinancialData';

interface FinancialAlertsProps {
  metrics: FinancialMetrics;
  loading?: boolean;
}

export const FinancialAlerts = ({ metrics, loading = false }: FinancialAlertsProps) => {
  if (loading) {
    return (
      <Card className="animate-pulse bg-card border-border">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const alerts = [];

  // Alerta de parcelas vencidas
  if (metrics.parcelasVencidas > 0) {
    alerts.push({
      type: 'error',
      icon: AlertTriangle,
      title: 'Parcelas Vencidas',
      description: `Você tem ${metrics.parcelasVencidas} parcela(s) vencida(s). Entre em contato com os clientes para regularizar.`,
      badge: metrics.parcelasVencidas.toString()
    });
  }

  // Alerta de queda na receita
  if (metrics.crescimentoReceitas < -10) {
    alerts.push({
      type: 'warning',
      icon: TrendingDown,
      title: 'Queda na Receita',
      description: `Sua receita diminuiu ${Math.abs(metrics.crescimentoReceitas).toFixed(1)}% este mês. Considere revisar suas estratégias de vendas.`,
      badge: `${metrics.crescimentoReceitas.toFixed(1)}%`
    });
  }

  // Alerta de crescimento de despesas
  if (metrics.crescimentoDespesas > 20) {
    alerts.push({
      type: 'warning',
      icon: TrendingUp,
      title: 'Aumento nas Despesas',
      description: `Suas despesas aumentaram ${metrics.crescimentoDespesas.toFixed(1)}% este mês. Monitore os gastos.`,
      badge: `+${metrics.crescimentoDespesas.toFixed(1)}%`
    });
  }

  // Alerta de saldo negativo
  if (metrics.saldoLiquido < 0) {
    alerts.push({
      type: 'error',
      icon: DollarSign,
      title: 'Saldo Negativo',
      description: `Seu saldo líquido está negativo em ${formatCurrency(Math.abs(metrics.saldoLiquido))}. Revise urgentemente seus gastos.`,
      badge: 'Crítico'
    });
  }

  // Alerta de parcelas pendentes
  if (metrics.parcelasPendentes > 5) {
    alerts.push({
      type: 'info',
      icon: Clock,
      title: 'Muitas Parcelas Pendentes',
      description: `Você tem ${metrics.parcelasPendentes} parcelas pendentes. Acompanhe os vencimentos.`,
      badge: metrics.parcelasPendentes.toString()
    });
  }

  // Alerta positivo de crescimento
  if (metrics.crescimentoReceitas > 20) {
    alerts.push({
      type: 'success',
      icon: TrendingUp,
      title: 'Excelente Crescimento!',
      description: `Parabéns! Sua receita cresceu ${metrics.crescimentoReceitas.toFixed(1)}% este mês.`,
      badge: `+${metrics.crescimentoReceitas.toFixed(1)}%`
    });
  }

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
      case 'success': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
      case 'info': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
      default: return 'border-border bg-muted';
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      case 'info': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <AlertTriangle className="w-5 h-5" />
          Alertas Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Tudo está funcionando bem! Nenhum alerta no momento.
              </AlertDescription>
            </Alert>
          ) : (
            alerts.map((alert, index) => (
              <Alert key={index} className={getAlertBorderColor(alert.type)}>
                <alert.icon className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-1 text-foreground">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.description}</div>
                    </div>
                    <Badge variant={getAlertBadgeVariant(alert.type)} className="ml-2">
                      {alert.badge}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
