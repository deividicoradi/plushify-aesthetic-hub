
import React from 'react';
import { LayoutDashboard, Users, CalendarDays, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { useSubscription } from '@/hooks/useSubscription';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tier, isLoading, isSubscribed } = useSubscription();

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
      to: "/dashboard",
      color: "from-[#33C3F0] to-[#9b87f5]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <LayoutDashboard className="w-6 h-6 text-plush-600" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {isSubscribed ? (
        <>
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
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-plush-50 to-purple-50 p-6 rounded-lg border border-plush-100">
            <h2 className="text-xl font-semibold text-plush-800 mb-3">Bem-vindo ao Plushify!</h2>
            <p className="text-plush-700 mb-4">
              Para aproveitar ao máximo nossa plataforma, assine um de nossos planos e tenha acesso a recursos exclusivos.
            </p>
            <button 
              className="bg-plush-600 hover:bg-plush-700 text-white px-4 py-2 rounded-md transition-colors"
              onClick={() => navigate('/planos')}
            >
              Ver planos
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recursos disponíveis no plano gratuito</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    <span>Gerenciamento básico de clientes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    <span>Agendamentos simples</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    <span>Anotações ilimitadas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Próximos passos</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal pl-5">
                  <li>Explore seu painel gratuito</li>
                  <li>Adicione seus primeiros clientes</li>
                  <li>Crie seu primeiro agendamento</li>
                  <li>
                    <span className="text-plush-600 hover:underline cursor-pointer" onClick={() => navigate('/planos')}>
                      Assine um plano para desbloquear todos os recursos
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
