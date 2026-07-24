import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

interface WeeklyChartsProps {
  chartData: Array<{
    day: string;
    agendamentos: number;
    faturamento: number;
  }>;
  formatCurrency: (value: number) => string;
}

const tooltipStyle = {
  backgroundColor: '#1a1322',
  border: '1px solid rgba(214,94,154,0.3)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
  padding: '8px 12px',
};

const ChartShell = ({
  Icon,
  title,
  subtitle,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[#1a1322] border border-white/5 rounded-3xl p-6 flex flex-col">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#D65E9A]/10 rounded-xl">
          <Icon className="w-5 h-5 text-[#D65E9A]" />
        </div>
        <div>
          <h3 className="text-white font-bold font-[Sora,system-ui,sans-serif] text-base leading-tight">
            {title}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className="h-72">{children}</div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="h-full flex items-center justify-center text-gray-500 text-sm">{message}</div>
);

export const WeeklyCharts = ({ chartData, formatCurrency }: WeeklyChartsProps) => {
  const hasData = chartData && chartData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <ChartShell
        Icon={Activity}
        title="Agendamentos"
        subtitle="Últimos 30 dias"
      >
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="agArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D65E9A" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#D65E9A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#D65E9A', strokeOpacity: 0.3 }} />
              <Area
                type="monotone"
                dataKey="agendamentos"
                stroke="#D65E9A"
                strokeWidth={3}
                fill="url(#agArea)"
                dot={{ fill: '#D65E9A', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#D65E9A', stroke: '#1a1322', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="Nenhum agendamento no período selecionado" />
        )}
      </ChartShell>

      <ChartShell
        Icon={TrendingUp}
        title="Faturamento"
        subtitle="Últimos 30 dias"
      >
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="ftBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D65E9A" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#D65E9A" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
                contentStyle={tooltipStyle}
                cursor={{ fill: 'rgba(214,94,154,0.08)' }}
              />
              <Bar dataKey="faturamento" fill="url(#ftBar)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="Nenhum faturamento no período selecionado" />
        )}
      </ChartShell>
    </div>
  );
};
