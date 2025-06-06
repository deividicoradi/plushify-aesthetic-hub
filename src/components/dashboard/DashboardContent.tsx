
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { StatsChart } from '@/components/dashboard/StatsChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WeeklyOverview } from '@/components/dashboard/WeeklyOverview';
import { QuickHelp } from '@/components/dashboard/QuickHelp';
import { TeamManagement } from '@/components/premium/TeamManagement';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useSubscription } from '@/hooks/useSubscription';

export const DashboardContent = () => {
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();

  return (
    <div className="space-y-6 p-1">
      {/* Grid Principal - Layout Responsivo Otimizado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda - Ações e Ajuda */}
        <div className="lg:col-span-3 space-y-6">
          <QuickActions />
          <QuickHelp />
        </div>

        {/* Coluna Central - Gráficos e Visão Geral */}
        <div className="lg:col-span-6 space-y-6">
          <StatsChart />
          <WeeklyOverview />
        </div>

        {/* Coluna Direita - Alertas e Notificações */}
        <div className="lg:col-span-3 space-y-6">
          <AlertsPanel />
          <div className="lg:hidden">
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* Seção de Recursos Premium */}
      {hasFeature('premium') && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">✨</span>
            </div>
            <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100">Recursos Premium</h2>
          </div>
          <TeamManagement />
        </div>
      )}

      {/* Seção de Atividades e Agendamentos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-border/50">
            <h3 className="text-lg font-semibold text-card-foreground">Atividade Recente</h3>
            <p className="text-sm text-muted-foreground">Últimas movimentações do seu negócio</p>
          </div>
          <div className="p-6">
            {hasFeature('starter') ? (
              <RecentActivity />
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="text-lg font-medium text-card-foreground mb-2">Recursos Avançados</h4>
                <p className="text-muted-foreground mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium"
                >
                  Ver planos
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 border-b border-border/50">
            <h3 className="text-lg font-semibold text-card-foreground">Próximos Agendamentos</h3>
            <p className="text-sm text-muted-foreground">Seus compromissos mais próximos</p>
          </div>
          <div className="p-6">
            {hasFeature('starter') ? (
              <UpcomingAppointments />
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h4 className="text-lg font-medium text-card-foreground mb-2">Gestão de Agendamentos</h4>
                <p className="text-muted-foreground mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium"
                >
                  Ver planos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
