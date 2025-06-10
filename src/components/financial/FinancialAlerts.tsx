
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
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      case 'info': return 'default';
      default: return 'default';
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

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alertas Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <Alert className="border-green-200 bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
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
                      <div className="font-medium mb-1">{alert.title}</div>
                      <div className="text-sm">{alert.description}</div>
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
