
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernMetricCard } from '@/components/dashboard/ModernMetricCard';
import { InteractiveChart } from '@/components/dashboard/InteractiveChart';
import { ModernActivityFeed } from '@/components/dashboard/ModernActivityFeed';
import { FloatingActionButtons } from '@/components/dashboard/FloatingActionButtons';
import { WeeklyOverview } from '@/components/dashboard/WeeklyOverview';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { QuickHelp } from '@/components/dashboard/QuickHelp';
import { TeamManagement } from '@/components/premium/TeamManagement';
import { Users, CalendarDays, Receipt, TrendingUp } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();
  const { 
    totalClients, 
    activeClients, 
    newThisMonth, 
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
      gradientClass: "from-purple-500 via-purple-600 to-indigo-600",
      trendUp: newThisMonth > 0,
    },
    {
      title: "Agendamentos",
      value: loading ? "..." : weeklyAppointments.toLocaleString(),
      trend: weeklyAppointments > 10 ? "+Alta" : weeklyAppointments > 0 ? "+Baixa" : "Nenhum",
      icon: CalendarDays,
      description: "Esta semana",
      to: "/appointments",
      gradientClass: "from-blue-500 via-blue-600 to-cyan-600",
      trendUp: weeklyAppointments > 0,
    },
    {
      title: "Receita",
      value: loading ? "..." : `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      trend: monthlyRevenue > 1000 ? "+23.1%" : monthlyRevenue > 0 ? "+5.0%" : "+0%",
      icon: Receipt,
      description: "Este mês",
      to: hasFeature('pro') ? "/financial" : "/planos",
      gradientClass: "from-green-500 via-green-600 to-emerald-600",
      trendUp: monthlyRevenue > 0,
    },
    {
      title: "Crescimento",
      value: hasFeature('pro') ? "94%" : "Pro",
      trend: hasFeature('pro') ? "+4.3%" : undefined,
      icon: TrendingUp,
      description: hasFeature('pro') ? "Meta mensal" : "Upgrade para Pro",
      to: hasFeature('pro') ? "/reports" : "/planos",
      gradientClass: "from-orange-500 via-red-500 to-pink-600",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8 p-1 relative">
      {/* Hero Section with Metrics */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricItems.map((item, idx) => (
            <ModernMetricCard
              key={item.title}
              title={item.title}
              value={item.value}
              trend={item.trend}
              icon={item.icon}
              description={item.description}
              onClick={() => navigate(item.to)}
              gradientClass={item.gradientClass}
              trendUp={item.trendUp}
            />
          ))}
        </div>
      </div>

      {/* Interactive Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <InteractiveChart />
        </div>
        <div className="space-y-6">
          <WeeklyOverview />
        </div>
      </div>

      {/* Activity and Alerts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ModernActivityFeed />
        <div className="space-y-6">
          <AlertsPanel />
          <QuickHelp />
        </div>
      </div>

      {/* Premium Features Section */}
      {hasFeature('premium') && (
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800/30">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-purple-500/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">✨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recursos Premium
                </h2>
                <p className="text-purple-700 dark:text-purple-300">
                  Funcionalidades avançadas para o seu negócio
                </p>
              </div>
            </div>
            <TeamManagement />
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};
