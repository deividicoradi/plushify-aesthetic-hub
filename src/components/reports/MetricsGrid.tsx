
import React from 'react';
import { parseISO } from 'date-fns';
import { Users, CalendarDays, Receipt, Package, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { FeatureGuard } from '@/components/FeatureGuard';
import { ReportsMetrics } from '@/hooks/useReportsData';
import { DetailsListModal, type DetailsSection } from '@/components/common/DetailsListModal';
import {
  useReportsDetails,
  type ReportsMetricKey,
  type PaymentDetailRow,
  type CashClosureDetailRow,
  type ClientRow,
  type AppointmentDetailRow,
  type ProductDetailRow,
} from '@/hooks/reports/useReportsDetails';

interface MetricCardProps {
  title: string;
  value: number;
  growth?: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  colorClass: string;
  loading: boolean;
  onClick: () => void;
  requiresFeature?: string;
  clickable?: boolean;
}

const MetricCard = ({ title, value, growth, icon: Icon, description, colorClass, loading, onClick, requiresFeature, clickable = true }: MetricCardProps) => {
  const cardContent = (
    <Card 
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer transition-all duration-200 bg-card border-border hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={onClick}
      aria-label={clickable ? `${title} — ver detalhes` : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? '...' : (title.includes('Receita') ? fmtCurrency(value) : value.toString())}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {growth !== undefined && (
              <div className={`text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs mês anterior
              </div>
            )}
            {clickable && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                Ver detalhes <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClass} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (requiresFeature) {
    return (
      <FeatureGuard 
        planFeature={requiresFeature as any}
        showUpgradePrompt={false}
        fallback={
          <Card className="opacity-50 cursor-not-allowed bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{title}</p>
                  <p className="text-2xl font-bold text-foreground">---</p>
                  <p className="text-xs text-muted-foreground">Requer upgrade</p>
                </div>
                <div className={`p-3 rounded-full ${colorClass} text-white opacity-50`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        }
      >
        {cardContent}
      </FeatureGuard>
    );
  }

  return cardContent;
};

interface MetricsGridProps {
  metrics: ReportsMetrics | null;
  loading: boolean;
  onCardClick: (route: string) => void;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  // parseISO trata "yyyy-MM-dd" (closure_date, appointment_date) como data
  // local; new Date() trataria como UTC e mostraria o dia anterior em
  // fusos negativos (ex: Brasil).
  const dt = parseISO(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('pt-BR');
};

const ClientItem = ({ c }: { c: ClientRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">{c.name}</p>
      <p className="text-xs text-muted-foreground truncate">
        {c.email || c.phone || 'Sem contato'} · Cadastro: {fmtDate(c.created_at)}
      </p>
    </div>
    {c.status && (
      <Badge variant="outline" className="ml-3 shrink-0">{c.status}</Badge>
    )}
  </div>
);

const PaymentDetailItem = ({ p }: { p: PaymentDetailRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">{p.description || 'Pagamento'}</p>
      <p className="text-xs text-muted-foreground truncate">
        {p.client_name || 'Sem cliente'} · {fmtDate(p.payment_date || p.created_at)}
        {p.payment_method_name ? ` · ${p.payment_method_name}` : ''}
      </p>
    </div>
    <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap ml-3">
      {fmtCurrency(Number(p.paid_amount) || 0)}
    </span>
  </div>
);

const CashClosureDetailItem = ({ c }: { c: CashClosureDetailRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">Fechamento de caixa</p>
      <p className="text-xs text-muted-foreground">{fmtDate(c.closure_date)}</p>
    </div>
    <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap ml-3">
      {fmtCurrency(Number(c.total_income) || 0)}
    </span>
  </div>
);

const AppointmentItem = ({ a }: { a: AppointmentDetailRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">
        {a.client_name} · {a.service_name}
      </p>
      <p className="text-xs text-muted-foreground truncate">
        {fmtDate(a.appointment_date)} {a.appointment_time?.slice(0, 5)}
        {a.professional_name ? ` · ${a.professional_name}` : ''}
        {a.status ? ` · ${a.status}` : ''}
      </p>
    </div>
    <span className="text-sm font-semibold whitespace-nowrap ml-3">
      {fmtCurrency(Number(a.price) || 0)}
    </span>
  </div>
);

const ProductItem = ({ p }: { p: ProductDetailRow }) => {
  const low = (p.stock_quantity || 0) <= (p.min_stock_level || 0);
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{p.name}</p>
          {low && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Estoque baixo
            </Badge>
          )}
          {!p.active && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Inativo
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {p.category || 'Sem categoria'} · Estoque: {p.stock_quantity ?? 0}
          {p.min_stock_level != null ? ` (mín. ${p.min_stock_level})` : ''}
        </p>
      </div>
      <span className="text-sm font-semibold whitespace-nowrap ml-3">
        {fmtCurrency(Number(p.price) || 0)}
      </span>
    </div>
  );
};

export const MetricsGrid = ({ metrics, loading, onCardClick }: MetricsGridProps) => {
  const [activeMetric, setActiveMetric] = React.useState<ReportsMetricKey | null>(null);
  const { data, loading: detailsLoading } = useReportsDetails(activeMetric);

  const openModal = (m: ReportsMetricKey) => setActiveMetric(m);
  const closeModal = () => setActiveMetric(null);

  let modalProps: React.ComponentProps<typeof DetailsListModal> | null = null;
  if (activeMetric) {
    if (activeMetric === 'totalClients') {
      const list = data?.clients ?? [];
      const sections: DetailsSection[] = [
        {
          key: 'clients',
          title: 'Clientes',
          items: list,
          getDate: (c: ClientRow) => c.created_at,
          render: (c: ClientRow) => <ClientItem key={c.id} c={c} />,
        },
      ];
      modalProps = {
        open: true,
        onOpenChange: (v) => !v && closeModal(),
        title: 'Total de Clientes',
        description: 'Todos os clientes cadastrados no sistema.',
        loading: detailsLoading,
        headerTotal: String(list.length),
        headerTotalLabel: 'Clientes',
        headerCount: list.length,
        sections,
      };
    } else if (activeMetric === 'totalRevenue') {
      const payments = data?.payments ?? [];
      const cash = data?.cashClosures ?? [];
      const sumP = payments.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0);
      const sumC = cash.reduce((s, c) => s + (Number(c.total_income) || 0), 0);
      modalProps = {
        open: true,
        onOpenChange: (v) => !v && closeModal(),
        title: 'Receita Total',
        description:
          'Pagamentos com status "pago" (paid_amount) somados aos fechamentos de caixa (total_income). Sem soma duplicada — são registros distintos.',
        loading: detailsLoading,
        headerTotal: fmtCurrency(sumP + sumC),
        headerCount: payments.length + cash.length,
        sections: [
          {
            key: 'payments',
            title: 'Pagamentos recebidos',
            totalLabel: fmtCurrency(sumP),
            items: payments,
            getDate: (p: PaymentDetailRow) => p.payment_date || p.created_at,
            render: (p: PaymentDetailRow) => <PaymentDetailItem key={p.id} p={p} />,
          },
          {
            key: 'cash',
            title: 'Fechamentos de caixa',
            totalLabel: fmtCurrency(sumC),
            items: cash,
            getDate: (c: CashClosureDetailRow) => c.closure_date,
            render: (c: CashClosureDetailRow) => <CashClosureDetailItem key={c.id} c={c} />,
          },
        ],
      };
    } else if (activeMetric === 'totalAppointments') {
      const list = data?.appointments ?? [];
      modalProps = {
        open: true,
        onOpenChange: (v) => !v && closeModal(),
        title: 'Agendamentos',
        description: 'Todos os agendamentos cadastrados.',
        loading: detailsLoading,
        headerTotal: String(list.length),
        headerTotalLabel: 'Agendamentos',
        headerCount: list.length,
        sections: [
          {
            key: 'appointments',
            title: 'Agendamentos',
            items: list,
            getDate: (a: AppointmentDetailRow) =>
              `${a.appointment_date}T${a.appointment_time || '00:00'}`,
            render: (a: AppointmentDetailRow) => <AppointmentItem key={a.id} a={a} />,
          },
        ],
      };
    } else if (activeMetric === 'totalProducts') {
      const list = data?.products ?? [];
      const lowCount = list.filter(
        (p) => (p.stock_quantity || 0) <= (p.min_stock_level || 0)
      ).length;
      modalProps = {
        open: true,
        onOpenChange: (v) => !v && closeModal(),
        title: 'Produtos Cadastrados',
        description: `Produtos com estoque baixo destacados (stock_quantity ≤ min_stock_level). ${lowCount} produto(s) em estoque baixo.`,
        loading: detailsLoading,
        headerTotal: String(list.length),
        headerTotalLabel: 'Produtos',
        headerCount: list.length,
        sections: [
          {
            key: 'products',
            title: 'Produtos',
            items: list,
            getDate: (p: ProductDetailRow) => p.created_at,
            render: (p: ProductDetailRow) => <ProductItem key={p.id} p={p} />,
          },
        ],
      };
    }
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        title="Total de Clientes"
        value={metrics?.totalClients || 0}
        growth={metrics?.clientsGrowth}
        icon={Users}
        description="Clientes cadastrados"
        colorClass="bg-emerald-600"
        loading={loading}
        onClick={() => openModal('totalClients')}
      />

      <MetricCard
        title="Receita Total"
        value={metrics?.totalRevenue || 0}
        growth={metrics?.revenueGrowth}
        icon={Receipt}
        description="Receita acumulada"
        colorClass="bg-blue-600"
        loading={loading}
        onClick={() => openModal('totalRevenue')}
        requiresFeature="hasFinancialManagement"
      />

      <MetricCard
        title="Agendamentos"
        value={metrics?.totalAppointments || 0}
        growth={metrics?.appointmentsGrowth}
        icon={CalendarDays}
        description="Total de agendamentos"
        colorClass="bg-purple-600"
        loading={loading}
        onClick={() => openModal('totalAppointments')}
      />

      <MetricCard
        title="Produtos Cadastrados"
        value={metrics?.totalProducts || 0}
        icon={Package}
        description={`${metrics?.lowStockProducts || 0} com estoque baixo`}
        colorClass="bg-orange-600"
        loading={loading}
        onClick={() => openModal('totalProducts')}
        requiresFeature="hasInventoryAdvanced"
      />
    </div>
    {modalProps && <DetailsListModal {...modalProps} />}
    </>
  );
};
