
import React from 'react';
import { Users, CalendarDays, Receipt, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useSubscription } from '@/hooks/useSubscription';

export const DashboardMetrics = () => {
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();

  const metricItems = [
    {
      title: "Total de Clientes",
      value: "1,234",
      trend: "+12.3%",
      icon: Users,
      description: "Últimos 30 dias",
      to: "/clients",
      color: "from-[#9b87f5] to-[#7E69AB]",
      clickable: true,
    },
    {
      title: "Agendamentos",
      value: "156",
      trend: "+8.2%",
      icon: CalendarDays,
      description: "Esta semana",
      to: "/appointments",
      color: "from-[#6E59A5] to-[#9b87f5]",
      clickable: true,
    },
    {
      title: "Receita",
      value: "R$ 15.290",
      trend: "+23.1%",
      icon: Receipt,
      description: "Este mês",
      to: hasFeature('pro') ? "/financial" : "/planos",
      color: "from-[#8B5CF6] to-[#D6BCFA]",
      clickable: true,
    },
    {
      title: "Relatórios",
      value: hasFeature('pro') ? "Disponível" : "Pro",
      trend: hasFeature('pro') ? "+4.3%" : undefined,
      icon: TrendingUp,
      description: hasFeature('pro') ? "Análises avançadas" : "Upgrade para Pro",
      to: hasFeature('pro') ? "/reports" : "/planos",
      color: "from-[#33C3F0] to-[#9b87f5]",
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
