import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, DollarSign, UserMinus, ShieldAlert, Layers, AlertTriangle, Ticket, LifeBuoy, Handshake } from 'lucide-react';
import { AdminCancellations } from '@/components/admin/AdminCancellations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { DetailsListModal, DetailsSection } from '@/components/common/DetailsListModal';
import { supabase } from '@/integrations/supabase/client';
import { AdminCustomersTable } from '@/components/admin/AdminCustomersTable';
import { AdminAuditTable } from '@/components/admin/AdminAuditTable';
import { AdminRevenueChart } from '@/components/admin/AdminRevenueChart';
import { AdminPendingIssues } from '@/components/admin/AdminPendingIssues';
import { AdminCoupons } from '@/components/admin/AdminCoupons';
import { AdminSupport } from '@/components/admin/AdminSupport';
import { AdminProspects } from '@/components/admin/AdminProspects';

interface OverviewStats {
  total_users: number;
  new_signups_30d: number;
  active_by_plan: Record<string, number>;
  mrr_cents: number;
  cancellations_30d: number;
  churn_rate_pct: number;
  generated_at: string;
}

interface UserRow {
  user_id: string;
  email: string;
  signed_up_at: string;
}

interface ActiveSubscriptionRow {
  user_id: string;
  email: string;
  plan_type: string;
  billing_interval: string | null;
  plan_amount_paid: number | null;
  mrr_contribution_cents: number | null;
  started_at: string;
}

interface CancellationRow {
  user_id: string;
  email: string;
  plan_type: string;
  status: string;
  updated_at: string;
}

interface OverviewDetails {
  users: UserRow[];
  new_signups: UserRow[];
  active_subscriptions: ActiveSubscriptionRow[];
  cancellations: CancellationRow[];
}

type OverviewCardKey = 'total_users' | 'new_signups' | 'mrr' | 'cancellations';

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  professional: 'Profissional',
  premium: 'Premium',
};

const STATUS_LABELS: Record<string, string> = {
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  disputed: 'Contestado',
};

const AdminDashboard: React.FC = () => {
  const [openCard, setOpenCard] = useState<OverviewCardKey | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async (): Promise<OverviewStats> => {
      const { data, error } = await supabase.rpc('admin_get_overview_stats');
      if (error) throw error;
      return data as unknown as OverviewStats;
    },
  });

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ['admin-overview-details'],
    queryFn: async (): Promise<OverviewDetails> => {
      const { data, error } = await supabase.rpc('admin_get_overview_details');
      if (error) throw error;
      return data as unknown as OverviewDetails;
    },
    enabled: openCard !== null || selectedPlan !== null,
  });

  const { data: engagementRisk } = useQuery({
    queryKey: ['admin-engagement-risk'],
    queryFn: async (): Promise<{ at_risk_count: number; threshold_days: number }> => {
      const { data, error } = await supabase.rpc('admin_get_engagement_risk');
      if (error) throw error;
      return data as unknown as { at_risk_count: number; threshold_days: number };
    },
  });

  const userRow = (row: UserRow) => (
    <div key={row.user_id} className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <p className="text-sm font-medium truncate">{row.email}</p>
      <p className="text-xs text-muted-foreground shrink-0 ml-3">
        {new Date(row.signed_up_at).toLocaleDateString('pt-BR')}
      </p>
    </div>
  );

  const subscriptionRow = (row: ActiveSubscriptionRow) => (
    <div key={row.user_id} className="flex items-start justify-between border-b border-border/50 pb-1.5">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{row.email}</p>
        <p className="text-xs text-muted-foreground">
          {PLAN_LABELS[row.plan_type] ?? row.plan_type}
          {row.billing_interval ? ` · ${row.billing_interval === 'year' ? 'Anual' : 'Mensal'}` : ''}
        </p>
      </div>
      <p className="text-sm font-medium shrink-0 ml-3">
        {row.mrr_contribution_cents != null ? formatBRL(row.mrr_contribution_cents) : '—'}
      </p>
    </div>
  );

  const cancellationRow = (row: CancellationRow) => (
    <div key={row.user_id} className="flex items-start justify-between border-b border-border/50 pb-1.5">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{row.email}</p>
        <p className="text-xs text-muted-foreground">{PLAN_LABELS[row.plan_type] ?? row.plan_type}</p>
      </div>
      <div className="text-right shrink-0 ml-3">
        <Badge variant="destructive" className="text-[10px]">{STATUS_LABELS[row.status] ?? row.status}</Badge>
        <p className="text-xs text-muted-foreground mt-1">{new Date(row.updated_at).toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  );

  const paidActiveSubscriptions = (details?.active_subscriptions ?? []).filter(
    (row) => row.plan_amount_paid != null,
  );

  const modalConfig: Record<OverviewCardKey, {
    title: string;
    headerTotal: string;
    headerTotalLabel: string;
    headerCount: number;
    sections: DetailsSection[];
  }> = {
    total_users: {
      title: 'Usuários totais',
      headerTotal: String(data?.total_users ?? 0),
      headerTotalLabel: 'Total de contas',
      headerCount: details?.users.length ?? 0,
      sections: [
        {
          key: 'users',
          title: 'Contas cadastradas',
          items: details?.users ?? [],
          getDate: (item: UserRow) => item.signed_up_at,
          render: userRow,
        },
      ],
    },
    new_signups: {
      title: 'Novos usuários (30 dias)',
      headerTotal: String(data?.new_signups_30d ?? 0),
      headerTotalLabel: 'Cadastros no período',
      headerCount: details?.new_signups.length ?? 0,
      sections: [
        {
          key: 'new_signups',
          title: 'Cadastros recentes',
          items: details?.new_signups ?? [],
          getDate: (item: UserRow) => item.signed_up_at,
          render: userRow,
        },
      ],
    },
    mrr: {
      title: 'MRR estimado',
      headerTotal: formatBRL(data?.mrr_cents ?? 0),
      headerTotalLabel: 'Receita recorrente mensal',
      headerCount: paidActiveSubscriptions.length,
      sections: [
        {
          key: 'active_subscriptions',
          title: 'Assinaturas ativas (pagas)',
          items: paidActiveSubscriptions,
          getDate: (item: ActiveSubscriptionRow) => item.started_at,
          render: subscriptionRow,
        },
      ],
    },
    cancellations: {
      title: 'Cancelamentos (30 dias)',
      headerTotal: String(data?.cancellations_30d ?? 0),
      headerTotalLabel: 'Assinaturas encerradas',
      headerCount: details?.cancellations.length ?? 0,
      sections: [
        {
          key: 'cancellations',
          title: 'Encerradas no período',
          items: details?.cancellations ?? [],
          getDate: (item: CancellationRow) => item.updated_at,
          render: cancellationRow,
        },
      ],
    },
  };

  const planSubscriptions = selectedPlan
    ? (details?.active_subscriptions ?? []).filter((row) => row.plan_type === selectedPlan)
    : [];

  const planModal = selectedPlan
    ? {
        title: `Assinaturas ativas — ${PLAN_LABELS[selectedPlan] ?? selectedPlan}`,
        headerTotal: String(data?.active_by_plan[selectedPlan] ?? planSubscriptions.length),
        headerTotalLabel: 'Assinaturas ativas',
        headerCount: planSubscriptions.length,
        sections: [
          {
            key: 'plan_subscriptions',
            title: PLAN_LABELS[selectedPlan] ?? selectedPlan,
            items: planSubscriptions,
            getDate: (item: ActiveSubscriptionRow) => item.started_at,
            render: subscriptionRow,
          },
        ] as DetailsSection[],
      }
    : null;

  const activeModal = openCard ? modalConfig[openCard] : planModal;
  const isModalOpen = openCard !== null || selectedPlan !== null;
  const closeModal = () => {
    setOpenCard(null);
    setSelectedPlan(null);
  };

  return (
    <ResponsiveLayout
      title="Painel Administrativo"
      subtitle="Acesso restrito a administradores."
      icon={ShieldAlert}
    >
      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="grid grid-cols-7 w-full min-w-[720px] sm:min-w-0 h-auto">
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
            <TabsTrigger value="issues" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Pendências</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
              <LifeBuoy className="w-4 h-4 shrink-0" />
              <span>Suporte</span>
            </TabsTrigger>
            <TabsTrigger value="cancellations" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
              <UserMinus className="w-4 h-4 shrink-0" />
              <span>Cancelamentos</span>
            </TabsTrigger>
            <TabsTrigger value="prospects" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
              <Handshake className="w-4 h-4 shrink-0" />
              <span>Comercial</span>
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
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenCard('total_users')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenCard('total_users');
                    }
                  }}
                  className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Usuários totais</CardTitle>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{data.total_users}</div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 hidden sm:block">Contas cadastradas</p>
                  </CardContent>
                </Card>

                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenCard('new_signups')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenCard('new_signups');
                    }
                  }}
                  className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-teal-700 dark:text-teal-300">Novos (30 dias)</CardTitle>
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-teal-900 dark:text-teal-100">{data.new_signups_30d}</div>
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 hidden sm:block">Cadastros recentes</p>
                  </CardContent>
                </Card>

                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenCard('mrr')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenCard('mrr');
                    }
                  }}
                  className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">MRR estimado</CardTitle>
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{formatBRL(data.mrr_cents)}</div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 hidden sm:block">Receita recorrente mensal</p>
                  </CardContent>
                </Card>

                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenCard('cancellations')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenCard('cancellations');
                    }
                  }}
                  className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Cancelamentos (30 dias)</CardTitle>
                    <UserMinus className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">{data.cancellations_30d}</div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 hidden sm:block">
                      Churn: {data.churn_rate_pct}% dos pagantes
                    </p>
                  </CardContent>
                </Card>
              </div>

              <AdminRevenueChart />

              {!!engagementRisk && engagementRisk.at_risk_count > 0 && (
                <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                  <CardContent className="py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {engagementRisk.at_risk_count} cliente{engagementRisk.at_risk_count > 1 ? 's' : ''} pagante{engagementRisk.at_risk_count > 1 ? 's' : ''} sem acessar o sistema há mais de {engagementRisk.threshold_days} dias
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                        Risco de churn — veja o selo "Risco" na aba Clientes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      <div
                        key={plan}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPlan(plan)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPlan(plan);
                          }
                        }}
                        className="flex items-center justify-between text-sm border-b border-border py-2 last:border-0 cursor-pointer rounded-md px-2 -mx-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
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
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Ticket className="w-4 h-4 shrink-0" />
                <span>Cupons</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <AdminCustomersTable />
            </TabsContent>
            <TabsContent value="coupons">
              <AdminCoupons />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 sm:space-y-6">
          <AdminAuditTable />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4 sm:space-y-6">
          <AdminPendingIssues />
        </TabsContent>

        <TabsContent value="support" className="space-y-4 sm:space-y-6">
          <AdminSupport />
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-4 sm:space-y-6">
          <AdminCancellations />
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4 sm:space-y-6">
          <AdminProspects />
        </TabsContent>
      </Tabs>

      {activeModal && (
        <DetailsListModal
          open={isModalOpen}
          onOpenChange={(open) => !open && closeModal()}
          title={activeModal.title}
          loading={detailsLoading}
          headerTotal={activeModal.headerTotal}
          headerTotalLabel={activeModal.headerTotalLabel}
          headerCount={activeModal.headerCount}
          sections={activeModal.sections}
        />
      )}
    </ResponsiveLayout>
  );
};

export default AdminDashboard;
