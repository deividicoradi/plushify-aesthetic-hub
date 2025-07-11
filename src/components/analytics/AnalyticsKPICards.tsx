import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Calendar, Award, TrendingUp } from 'lucide-react';

interface AnalyticsKPICardsProps {
  totalClients: number;
  monthlyRevenue: number;
  weeklyAppointments: number;
  newThisMonth: number;
  revenueGrowth?: number;
}

const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({
  totalClients,
  monthlyRevenue,
  weeklyAppointments,
  newThisMonth,
  revenueGrowth
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (current: number, previous: number) => {
    if (previous === 0) return '+0%';
    const percentage = ((current - previous) / previous) * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClients}</div>
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            +{newThisMonth} este mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            {revenueGrowth ? formatPercentage(revenueGrowth, 0) : '+0%'} vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos Semanais</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Agendamentos desta semana
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(weeklyAppointments > 0 
              ? monthlyRevenue / weeklyAppointments * 4 
              : 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor médio por agendamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsKPICards;