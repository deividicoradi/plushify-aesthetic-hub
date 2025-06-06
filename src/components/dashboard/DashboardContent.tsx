
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
    <div className="space-y-4">
      {/* Layout responsivo baseado no plano */}
      {hasFeature('premium') ? (
        // Layout Premium - 4 colunas com recursos avançados
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Coluna 1 - Ações rápidas */}
          <div className="xl:col-span-3 space-y-4">
            <QuickActions />
            <WeeklyOverview />
            <QuickHelp />
          </div>

          {/* Coluna 2 - Gráficos */}
          <div className="xl:col-span-6 space-y-4">
            <StatsChart />
          </div>

          {/* Coluna 3 - Alertas */}
          <div className="xl:col-span-3">
            <AlertsPanel />
          </div>
        </div>
      ) : (
        // Layout padrão para outros planos
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-1 space-y-4">
            <QuickActions />
            <WeeklyOverview />
            <QuickHelp />
          </div>
          <div className="xl:col-span-2 space-y-4">
            <StatsChart />
          </div>
          <div className="xl:col-span-1">
            <AlertsPanel />
          </div>
        </div>
      )}

      {/* Recursos Premium adicionais */}
      {hasFeature('premium') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamManagement />
        </div>
      )}

      {/* Conteúdo baseado no plano */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {hasFeature('starter') ? (
              <RecentActivity />
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="text-primary hover:underline text-sm"
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
            <CardHeader className="pb-3">
              <CardTitle>Próximos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="text-primary hover:underline text-sm"
                >
                  Ver planos
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile notification center */}
      <div className="lg:hidden">
        <NotificationCenter />
      </div>
    </div>
  );
};
