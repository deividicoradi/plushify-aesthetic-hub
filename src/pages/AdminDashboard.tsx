import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, DollarSign, UserMinus, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OverviewStats {
  total_users: number;
  new_signups_30d: number;
  active_by_plan: Record<string, number>;
  mrr_cents: number;
  cancellations_30d: number;
  generated_at: string;
}

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  professional: 'Profissional',
  premium: 'Premium',
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async (): Promise<OverviewStats> => {
      const { data, error } = await supabase.rpc('admin_get_overview_stats');
      if (error) throw error;
      return data as unknown as OverviewStats;
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Visível apenas para {user?.email} — nenhum cliente tem acesso a esta página.
          </p>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando métricas...</p>}

      {!!error && (
        <p className="text-destructive text-sm">
          Erro ao carregar métricas: {(error as Error).message}
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Usuários totais</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Novos (30 dias)</CardTitle>
                <UserPlus className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.new_signups_30d}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MRR estimado</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBRL(data.mrr_cents)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cancelamentos (30 dias)</CardTitle>
                <UserMinus className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.cancellations_30d}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assinaturas ativas por plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.active_by_plan).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa ainda.</p>
                )}
                {Object.entries(data.active_by_plan).map(([plan, count]) => (
                  <div key={plan} className="flex justify-between text-sm border-b border-border py-2 last:border-0">
                    <span>{PLAN_LABELS[plan] ?? plan}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Gerado em {new Date(data.generated_at).toLocaleString('pt-BR')}
          </p>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
