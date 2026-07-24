import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReportsData } from '@/hooks/useReportsData';
import { useAnalyticsChartData } from '@/hooks/analytics/useAnalyticsData';
import { useAnalyticsKPIs } from '@/hooks/analytics/useAnalyticsKPIs';
import { useTimeAnalysis } from '@/hooks/analytics/useTimeAnalysis';
import { useClientROI } from '@/hooks/analytics/useClientROI';
import AnalyticsKPICards, { KPIKey } from './AnalyticsKPICards';
import {
  AnalyticsPeriodFilter,
  AnalyticsPeriod,
  computeRange,
} from './AnalyticsPeriodFilter';
import { DetailsListModal, DetailsSection } from '@/components/common/DetailsListModal';
import AnalyticsPipelineCharts from './AnalyticsPipelineCharts';
import AnalyticsPerformanceCharts from './AnalyticsPerformanceCharts';
import AnalyticsInsights from './AnalyticsInsights';
import PaymentMethodChart from './PaymentMethodChart';
import AppointmentStatusChart from './AppointmentStatusChart';
import ClientGrowthChart from './ClientGrowthChart';
import WeeklyPatternChart from './WeeklyPatternChart';
import RevenueVsExpensesChart from './RevenueVsExpensesChart';
import ServicePerformanceChart from './ServicePerformanceChart';

const currency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (d?: string | null) =>
  d ? format(new Date(d), "dd/MM/yyyy", { locale: ptBR }) : '—';

export const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('this_month');
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();

  const range = useMemo(
    () => computeRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  const { data: kpis, loading: kpisLoading } = useAnalyticsKPIs({
    startDate: range.startDate,
    endDate: range.endDate,
  });
  const reportsData = useReportsData();
  const {
    pipelineByAmountData,
    pipelineByCountData,
    quarterlyData,
    monthlyRevenueData,
    paymentMethodData,
    appointmentStatusData,
    clientGrowthData,
    weeklyPatternData,
    revenueVsExpensesData,
    servicePerformanceData,
    loading: chartLoading,
  } = useAnalyticsChartData({ startDate: range.startDate, endDate: range.endDate });

  const [openCard, setOpenCard] = useState<KPIKey | null>(null);

  // Insights (horário de pico e cliente VIP) são calculados sobre o
  // histórico completo, não sobre o período filtrado — padrões de horário
  // e o cliente que mais gera retorno fazem mais sentido olhando tudo.
  const { hourlyMovement } = useTimeAnalysis();
  const { data: topClients } = useClientROI(1);
  const peakHour = (hourlyMovement.data ?? []).reduce<{ hour: number; appointments_count: number } | null>(
    (best, current) => {
      if (current.appointments_count <= 0) return best;
      if (!best || current.appointments_count > best.appointments_count) {
        return { hour: current.hour, appointments_count: current.appointments_count };
      }
      return best;
    },
    null,
  );
  const topClient = topClients && topClients.length > 0 ? topClients[0] : null;

  const filterBar = (
    <AnalyticsPeriodFilter
      period={period}
      onPeriodChange={setPeriod}
      customStart={customStart}
      customEnd={customEnd}
      onCustomChange={(s, e) => {
        setCustomStart(s);
        setCustomEnd(e);
      }}
      label={range.label}
    />
  );

  if (kpisLoading || reportsData.loading || chartLoading || !kpis) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {filterBar}
        <AnalyticsKPICards
          totalClients={0}
          monthlyRevenue={0}
          weeklyAppointments={0}
          ticketMedio={0}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <div className="h-64 sm:h-80 bg-muted rounded animate-pulse" />
          <div className="h-64 sm:h-80 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const modalConfig: Record<KPIKey, { title: string; description?: string; total: string; totalLabel?: string; count: number; sections: DetailsSection[]; }> = {
    clients: {
      title: 'Total de Clientes',
      description: 'Clientes cadastrados no período selecionado.',
      total: String(kpis.totalClients),
      totalLabel: 'Clientes',
      count: kpis.clients.length,
      sections: [
        {
          key: 'clients',
          title: 'Clientes',
          items: kpis.clients,
          getDate: (c: any) => c.created_at,
          render: (c: any) => (
            <div key={c.id} className="flex items-start justify-between border-b border-border/50 pb-1.5">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[c.email, c.phone].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-xs text-muted-foreground">{fmtDate(c.created_at)}</p>
                {c.status && <p className="text-[11px] text-muted-foreground">{c.status}</p>}
              </div>
            </div>
          ),
        },
      ],
    },
    revenue: {
      title: 'Receita Mensal',
      description: 'Pagamentos com status "pago" no período selecionado.',
      total: currency(kpis.monthlyRevenue),
      totalLabel: 'Receita no período',
      count: kpis.revenues.length,
      sections: [
        {
          key: 'payments',
          title: 'Pagamentos',
          items: kpis.revenues,
          getDate: (p: any) => p.payment_date || p.created_at,
          render: (p: any) => (
            <div key={p.id} className="flex items-start justify-between border-b border-border/50 pb-1.5">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.client_name || p.description || 'Pagamento'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[p.description, p.payment_method_name].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-semibold">{currency(p.amount)}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(p.payment_date || p.created_at)}</p>
              </div>
            </div>
          ),
        },
      ],
    },
    appointments: {
      title: 'Agendamentos Semanais',
      description: 'Agendamentos no período selecionado.',
      total: String(kpis.weeklyAppointments),
      totalLabel: 'Agendamentos',
      count: kpis.appointments.length,
      sections: [
        {
          key: 'appointments',
          title: 'Agendamentos',
          items: kpis.appointments,
          getDate: (a: any) => a.appointment_date,
          render: (a: any) => (
            <div key={a.id} className="flex items-start justify-between border-b border-border/50 pb-1.5">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{a.client_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {a.service_name}
                  {a.professional_name ? ` · ${a.professional_name}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-semibold">{currency(a.price)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(a.appointment_date)} {a.appointment_time?.slice(0, 5)}
                </p>
                <p className="text-[11px] text-muted-foreground">{a.status}</p>
              </div>
            </div>
          ),
        },
      ],
    },
    ticket: {
      title: 'Ticket Médio',
      description: `Cálculo: soma dos pagamentos (${currency(kpis.ticketSum)}) ÷ ${kpis.ticketCount} registro(s) = ${currency(kpis.ticketMedio)}.`,
      total: currency(kpis.ticketMedio),
      totalLabel: 'Ticket médio',
      count: kpis.revenues.length,
      sections: [
        {
          key: 'ticket',
          title: 'Pagamentos considerados',
          totalLabel: `Soma: ${currency(kpis.ticketSum)}`,
          items: kpis.revenues,
          getDate: (p: any) => p.payment_date || p.created_at,
          render: (p: any) => (
            <div key={p.id} className="flex items-start justify-between border-b border-border/50 pb-1.5">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.client_name || p.description || 'Pagamento'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[p.description, p.payment_method_name].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-semibold">{currency(p.amount)}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(p.payment_date || p.created_at)}</p>
              </div>
            </div>
          ),
        },
      ],
    },
  };

  const active = openCard ? modalConfig[openCard] : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {filterBar}

      {/* Métricas Principais */}
      <AnalyticsKPICards
        totalClients={kpis.totalClients}
        monthlyRevenue={kpis.monthlyRevenue}
        weeklyAppointments={kpis.weeklyAppointments}
        ticketMedio={kpis.ticketMedio}
        revenueGrowth={reportsData.metrics?.revenueGrowth}
        onCardClick={(k) => setOpenCard(k)}
      />

      {/* Gráficos Principais */}
      <AnalyticsPipelineCharts
        pipelineByAmountData={pipelineByAmountData}
        pipelineByCountData={pipelineByCountData}
      />

      {/* Gráficos de Performance */}
      <AnalyticsPerformanceCharts
        quarterlyData={quarterlyData}
        monthlyRevenueData={monthlyRevenueData}
      />

      {/* Análises Financeiras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <PaymentMethodChart data={paymentMethodData} />
        <RevenueVsExpensesChart data={revenueVsExpensesData} />
      </div>

      {/* Análises de Agendamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <AppointmentStatusChart data={appointmentStatusData} />
        <WeeklyPatternChart data={weeklyPatternData} />
      </div>

      {/* Análises de Clientes e Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <ClientGrowthChart data={clientGrowthData} />
        <ServicePerformanceChart data={servicePerformanceData} />
      </div>

      {/* Resumo de Insights */}
      <AnalyticsInsights
        newThisMonth={kpis.totalClients}
        periodLabel={range.label}
        peakHour={peakHour}
        topClient={topClient}
      />

      {active && (
        <DetailsListModal
          open={openCard !== null}
          onOpenChange={(o) => !o && setOpenCard(null)}
          title={active.title}
          description={active.description}
          headerTotal={active.total}
          headerTotalLabel={active.totalLabel}
          headerCount={active.count}
          sections={active.sections}
          periodLabel={range.label}
        />
      )}
    </div>
  );
};