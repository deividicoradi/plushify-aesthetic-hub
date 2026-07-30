import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, DollarSign, UserMinus, ShieldAlert, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AdminCustomersTable } from '@/components/admin/AdminCustomersTable';
import { AdminAuditTable } from '@/components/admin/AdminAuditTable';

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
    <ResponsiveLayout
      title="Painel Administrativo"
      subtitle={`Visível apenas para ${user?.email ?? 'administradores'} — nenhum cliente tem acesso a esta página.`}
      icon={ShieldAlert}
    >
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="grid grid-cols-3 w-full min-w-[320px] sm:min-w-0 h-auto">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
              <Users className="w-4 h-4 shrink-0" />
              <span>Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Auditoria</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!!error && (
            <p className="text-destructive text-sm">
              Erro ao carregar métricas: {(error as Error).message}
            </p>
          )}

          {data && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Usuários totais</CardTitle>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{data.total_users}</div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 hidden sm:block">Contas cadastradas</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-teal-700 dark:text-teal-300">Novos (30 dias)</CardTitle>
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-teal-900 dark:text-teal-100">{data.new_signups_30d}</div>
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 hidden sm:block">Cadastros recentes</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">MRR estimado</CardTitle>
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{formatBRL(data.mrr_cents)}</div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 hidden sm:block">Receita recorrente mensal</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Cancelamentos (30 dias)</CardTitle>
                    <UserMinus className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">{data.cancellations_30d}</div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 hidden sm:block">Assinaturas encerradas</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Assinaturas ativas por plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(data.active_by_plan).length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa ainda.</p>
                    )}
                    {Object.entries(data.active_by_plan).map(([plan, count]) => (
                      <div key={plan} className="flex items-center justify-between text-sm border-b border-border py-2 last:border-0">
                        <Badge variant="secondary">{PLAN_LABELS[plan] ?? plan}</Badge>
                        <span className="font-medium text-foreground">{count}</span>
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
        </TabsContent>

        <TabsContent value="customers" className="space-y-4 sm:space-y-6">
          <AdminCustomersTable />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 sm:space-y-6">
          <AdminAuditTable />
        </TabsContent>
      </Tabs>
    </ResponsiveLayout>
  );
};

export default AdminDashboard;
