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

  const ticketMedio = weeklyAppointments > 0 ? (monthlyRevenue / weeklyAppointments) * 4 : 0;
  const cards = [
    {
      title: 'Total de Clientes',
      icon: Users,
      value: String(totalClients),
      hint: (
        <>
          <TrendingUp className="h-3 w-3 inline mr-1" />
          +{newThisMonth} este mês
        </>
      ),
    },
    {
      title: 'Receita Mensal',
      icon: DollarSign,
      value: formatCurrency(monthlyRevenue),
      hint: (
        <>
          <TrendingUp className="h-3 w-3 inline mr-1" />
          {revenueGrowth ? formatPercentage(revenueGrowth, 0) : '+0%'} vs mês ant.
        </>
      ),
    },
    {
      title: 'Agend. Semanais',
      icon: Calendar,
      value: String(weeklyAppointments),
      hint: 'Agendamentos desta semana',
    },
    {
      title: 'Ticket Médio',
      icon: Award,
      value: formatCurrency(ticketMedio),
      hint: 'Valor médio por agendamento',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map(({ title, icon: Icon, value, hint }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6 lg:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 lg:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{value}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">{hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsKPICards;