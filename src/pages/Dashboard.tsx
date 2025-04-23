
import React from 'react';
import { LayoutDashboard, Users, CalendarDays, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';

const metricItems = [
  {
    title: "Total de Clientes",
    value: "1,234",
    trend: "+12.3%",
    icon: Users,
    description: "Últimos 30 dias",
    to: "/clientes",
    color: "from-[#9b87f5] to-[#7E69AB]",
  },
  {
    title: "Agendamentos",
    value: "156",
    trend: "+8.2%",
    icon: CalendarDays,
    description: "Esta semana",
    to: "/agendamentos",
    color: "from-[#6E59A5] to-[#9b87f5]",
  },
  {
    title: "Receita",
    value: "R$ 15.290",
    trend: "+23.1%",
    icon: Receipt,
    description: "Este mês",
    to: "/planos",
    color: "from-[#8B5CF6] to-[#D6BCFA]",
  },
  {
    title: "Taxa de Crescimento",
    value: "18.2%",
    trend: "+4.3%",
    icon: TrendingUp,
    description: "Comparado ao mês anterior",
    to: "/dashboard", // substitua pela tela certa se desejar
    color: "from-[#33C3F0] to-[#9b87f5]",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <LayoutDashboard className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricItems.map((item, idx) => (
            <MetricCard
              key={item.title}
              title={item.title}
              value={item.value}
              trend={item.trend}
              icon={item.icon}
              description={item.description}
              onClick={() => navigate(item.to)}
              gradientClass={item.color}
              tabIndex={0}
              role="button"
              aria-label={`Acessar ${item.title}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>

          <UpcomingAppointments />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
