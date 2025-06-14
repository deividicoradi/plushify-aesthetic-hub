
import React from 'react';
import { Users, CalendarDays, Receipt, Package } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { ReportsMetrics } from '@/hooks/useReportsData';

interface MetricCardProps {
  title: string;
  value: number;
  growth?: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  colorClass: string;
  loading: boolean;
  onClick: () => void;
}

const MetricCard = ({ title, value, growth, icon: Icon, description, colorClass, loading, onClick }: MetricCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-card border-border"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? '...' : (title.includes('Receita') ? `R$ ${value.toLocaleString('pt-BR')}` : value.toString())}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {growth !== undefined && (
              <div className={`text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs mês anterior
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClass} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricsGridProps {
  metrics: ReportsMetrics | null;
  loading: boolean;
  onCardClick: (route: string) => void;
}

export const MetricsGrid = ({ metrics, loading, onCardClick }: MetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        title="Total de Clientes"
        value={metrics?.totalClients || 0}
        growth={metrics?.clientsGrowth}
        icon={Users}
        description="Clientes cadastrados"
        colorClass="bg-emerald-600"
        loading={loading}
        onClick={() => onCardClick('/clients')}
      />

      <MetricCard
        title="Receita Total"
        value={metrics?.totalRevenue || 0}
        growth={metrics?.revenueGrowth}
        icon={Receipt}
        description="Receita acumulada"
        colorClass="bg-blue-600"
        loading={loading}
        onClick={() => onCardClick('/financial')}
      />

      <MetricCard
        title="Agendamentos"
        value={metrics?.totalAppointments || 0}
        growth={metrics?.appointmentsGrowth}
        icon={CalendarDays}
        description="Total de agendamentos"
        colorClass="bg-purple-600"
        loading={loading}
        onClick={() => onCardClick('/appointments')}
      />

      <MetricCard
        title="Produtos Cadastrados"
        value={metrics?.totalProducts || 0}
        icon={Package}
        description={`${metrics?.lowStockProducts || 0} com estoque baixo`}
        colorClass="bg-orange-600"
        loading={loading}
        onClick={() => onCardClick('/inventory')}
      />
    </div>
  );
};
