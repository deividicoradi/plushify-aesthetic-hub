import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Calendar, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type KPIKey = 'clients' | 'revenue' | 'appointments' | 'ticket';

interface AnalyticsKPICardsProps {
  totalClients: number;
  monthlyRevenue: number;
  weeklyAppointments: number;
  ticketMedio: number;
  newThisMonth?: number;
  revenueGrowth?: number;
  onCardClick?: (key: KPIKey) => void;
}

const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({
  totalClients,
  monthlyRevenue,
  weeklyAppointments,
  ticketMedio,
  newThisMonth,
  revenueGrowth,
  onCardClick,
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercentage = (current: number, previous: number) => {
    if (previous === 0) return '+0%';
    const percentage = ((current - previous) / previous) * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const cards: {
    key: KPIKey;
    title: string;
    icon: any;
    value: string;
    hint: React.ReactNode;
  }[] = [
    {
      key: 'clients',
      title: 'Total de Clientes',
      icon: Users,
      value: String(totalClients),
      hint:
        typeof newThisMonth === 'number' ? (
          <>
            <TrendingUp className="h-3 w-3 inline mr-1" />
            +{newThisMonth} este mês
          </>
        ) : (
          'Clientes no período'
        ),
    },
    {
      key: 'revenue',
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
      key: 'appointments',
      title: 'Agend. Semanais',
      icon: Calendar,
      value: String(weeklyAppointments),
      hint: 'Agendamentos no período',
    },
    {
      key: 'ticket',
      title: 'Ticket Médio',
      icon: Award,
      value: formatCurrency(ticketMedio),
      hint: 'Média por pagamento',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map(({ key, title, icon: Icon, value, hint }) => {
        const clickable = !!onCardClick;
        return (
          <Card
            key={key}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onCardClick!(key) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCardClick!(key);
                    }
                  }
                : undefined
            }
            className={cn(
              clickable &&
                'cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6 lg:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium truncate">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 lg:pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{value}</div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">{hint}</p>
              {clickable && (
                <p className="text-[10px] sm:text-[11px] text-primary/80 mt-1">Ver detalhes →</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnalyticsKPICards;