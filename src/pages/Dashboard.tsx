
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
  const { tier, isLoading, isSubscribed, hasFeature, getCurrentPlanInfo } = useSubscription();

  const currentPlan = getCurrentPlanInfo();

  const metricItems = [
    {
      title: "Total de Clientes",
      value: "1,234",
      trend: "+12.3%",
      icon: Users,
      description: "Últimos 30 dias",
      to: "/clientes",
      color: "from-[#9b87f5] to-[#7E69AB]",
      clickable: true,
    },
    {
      title: "Agendamentos",
      value: "156",
      trend: "+8.2%",
      icon: CalendarDays,
      description: "Esta semana",
      to: "/agendamentos",
      color: "from-[#6E59A5] to-[#9b87f5]",
      clickable: true,
    },
    {
      title: "Receita",
      value: "R$ 15.290",
      trend: "+23.1%",
      icon: Receipt,
      description: "Este mês",
      to: hasFeature('pro') ? "/financeiro" : "/planos",
      color: "from-[#8B5CF6] to-[#D6BCFA]",
      clickable: true,
    },
    {
      title: "Taxa de Crescimento",
      value: "18.2%",
      trend: "+4.3%",
      icon: TrendingUp,
      description: "Comparado ao mês anterior",
      to: null, // Não navega para lugar nenhum - apenas informativo
      color: "from-[#33C3F0] to-[#9b87f5]",
      clickable: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <LayoutDashboard className="w-6 h-6 text-plush-600" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Informações do plano atual */}
      <div className="bg-gradient-to-r from-plush-50 to-purple-50 p-6 rounded-lg border border-plush-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-plush-800 mb-2">
              Plano {currentPlan.name}
            </h2>
            <p className="text-plush-700">
              {isSubscribed ? 
                `Acesso completo às funcionalidades do plano ${currentPlan.name}` :
                'Acesso às funcionalidades básicas'
              }
            </p>
            {currentPlan.expiresAt && (
              <p className="text-sm text-plush-600 mt-1">
                Válido até: {new Date(currentPlan.expiresAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          {!isSubscribed && (
            <button 
              className="bg-plush-600 hover:bg-plush-700 text-white px-4 py-2 rounded-md transition-colors"
              onClick={() => navigate('/planos')}
            >
              Fazer upgrade
            </button>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Conteúdo baseado no plano */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {hasFeature('starter') ? (
              <RecentActivity />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="text-plush-600 hover:underline"
                >
                  Ver planos
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {hasFeature('starter') ? (
          <UpcomingAppointments />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="text-plush-600 hover:underline"
                >
                  Ver planos
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Funcionalidades desbloqueadas */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades do seu plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">Disponíveis</h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span>Gestão de clientes</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span>Agendamentos básicos</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span>Anotações ilimitadas</span>
                </li>
                {hasFeature('starter') && (
                  <>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                      <span>Comunicação avançada</span>
                    </li>
                  </>
                )}
                {hasFeature('pro') && (
                  <>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                      <span>Controle de estoque</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                      <span>Relatórios financeiros</span>
                    </li>
                  </>
                )}
                {hasFeature('premium') && (
                  <>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                      <span>Programa de fidelidade</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                      <span>Gestão de equipe</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            {!hasFeature('premium') && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-500">Disponíveis com upgrade</h4>
                <ul className="space-y-1">
                  {!hasFeature('starter') && (
                    <li className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                      <span>Comunicação avançada (Starter)</span>
                    </li>
                  )}
                  {!hasFeature('pro') && (
                    <>
                      <li className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                        <span>Controle de estoque (Pro)</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                        <span>Relatórios financeiros (Pro)</span>
                      </li>
                    </>
                  )}
                  {!hasFeature('premium') && (
                    <>
                      <li className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                        <span>Programa de fidelidade (Premium)</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                        <span>Gestão de equipe (Premium)</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
