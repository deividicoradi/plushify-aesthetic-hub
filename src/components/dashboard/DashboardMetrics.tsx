
import React from 'react';
import { Users, CalendarDays, Receipt, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export const DashboardMetrics = () => {
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();
  const { 
    totalClients, 
    activeClients, 
    newThisMonth, 
    totalAppointments,
    weeklyAppointments,
    monthlyRevenue,
    loading 
  } = useDashboardStats();

  const metricItems = [
    {
      title: "Total de Clientes",
      value: loading ? "..." : totalClients.toLocaleString(),
      trend: newThisMonth > 0 && totalClients > 0 ? `+${((newThisMonth / totalClients) * 100).toFixed(1)}%` : "+0%",
      icon: Users,
      description: "Últimos 30 dias",
      to: "/clients",
      color: "from-pink-500 via-rose-500 to-red-500",
      clickable: true,
    },
    {
      title: "Agendamentos",
      value: loading ? "..." : weeklyAppointments.toLocaleString(),
      trend: totalAppointments > 0 ? `${totalAppointments} total` : "Nenhum",
      icon: CalendarDays,
      description: "Esta semana",
      to: "/appointments",
      color: "from-cyan-500 via-blue-500 to-indigo-600",
      clickable: true,
    },
    {
      title: "Receita",
      value: loading ? "..." : `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      trend: monthlyRevenue > 1000 ? "+23.1%" : monthlyRevenue > 0 ? "+5.0%" : "+0%",
      icon: Receipt,
      description: "Este mês",
      to: hasFeature('pro') ? "/financial" : "/planos",
      color: "from-emerald-500 via-green-500 to-teal-600",
      clickable: true,
    },
    {
      title: "Relatórios",
      value: hasFeature('pro') ? "Disponível" : "Pro",
      trend: hasFeature('pro') ? "+4.3%" : undefined,
      icon: TrendingUp,
      description: hasFeature('pro') ? "Análises avançadas" : "Upgrade para Pro",
      to: hasFeature('pro') ? "/reports" : "/planos",
      color: "from-violet-500 via-purple-500 to-indigo-600",
      clickable: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricItems.map((item, idx) => (
        <MetricCard
          key={item.title}
          title={item.title}
          value={item.value}
          trend={item.trend}
          icon={item.icon}
          description={item.description}
          onClick={item.clickable && item.to ? () => navigate(item.to) : undefined}
          gradientClass={item.color}
          tabIndex={item.clickable ? 0 : -1}
          role={item.clickable ? "button" : undefined}
          aria-label={item.clickable ? `Acessar ${item.title}` : undefined}
        />
      ))}
    </div>
  );
};
