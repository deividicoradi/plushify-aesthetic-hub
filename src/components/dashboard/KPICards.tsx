import React from 'react';
import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KPICardsProps {
  metrics: {
    totalReceitas: number;
    crescimentoReceitas: number;
  } | null;
  dashboardStats: {
    totalClients: number;
    newThisMonth: number;
    totalAppointments: number;
    weeklyAppointments: number;
  };
  formatCurrency: (value: number) => string;
}

interface KpiProps {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean } | null;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

const KpiCard = ({ label, value, delta, Icon, onClick }: KpiProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group text-left bg-[#1a1322] hover:bg-[#2a1a2e] border border-white/5 hover:border-[#D65E9A]/30 p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 min-h-[140px]"
  >
    <div className="flex justify-between items-start">
      <div className="p-2 bg-[#D65E9A]/10 rounded-xl group-hover:bg-[#D65E9A]/20 transition-colors">
        <Icon className="w-5 h-5 text-[#D65E9A]" />
      </div>
      {delta && (
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
            delta.positive
              ? 'text-emerald-400 bg-emerald-400/10'
              : 'text-rose-400 bg-rose-400/10'
          }`}
        >
          {delta.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {delta.value}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <h3 className="text-2xl font-bold text-white mt-1 font-[Sora,system-ui,sans-serif] tracking-tight">
        {value}
      </h3>
    </div>
  </button>
);

export const KPICards = ({ metrics, dashboardStats, formatCurrency }: KPICardsProps) => {
  const saldoLiquido = metrics ? metrics.totalReceitas - ((metrics as any).totalDespesas ?? 0) : 0;
  const navigate = useNavigate();
  const growth = metrics?.crescimentoReceitas ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <KpiCard
        label="Receita Total"
        value={formatCurrency(metrics?.totalReceitas || 0)}
        delta={growth !== 0 ? { value: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`, positive: growth >= 0 } : null}
        Icon={DollarSign}
        onClick={() => navigate('/financial')}
      />
      <KpiCard
        label="Total Clientes"
        value={dashboardStats.totalClients || 0}
        delta={dashboardStats.newThisMonth ? { value: `+${dashboardStats.newThisMonth}`, positive: true } : null}
        Icon={Users}
        onClick={() => navigate('/clients')}
      />
      <KpiCard
        label="Agendamentos"
        value={dashboardStats.totalAppointments || 0}
        delta={
          dashboardStats.weeklyAppointments
            ? { value: `${dashboardStats.weeklyAppointments}/sem`, positive: true }
            : null
        }
        Icon={Calendar}
        onClick={() => navigate('/appointments')}
      />
      <KpiCard
        label="Saldo Líquido"
        value={formatCurrency(saldoLiquido)}
        delta={null}
        Icon={TrendingUp}
        onClick={() => navigate('/financial')}
      />
    </div>
  );
};
