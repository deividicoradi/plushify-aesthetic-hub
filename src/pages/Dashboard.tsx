
import React from 'react';
import { LayoutDashboard, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import new components we'll create
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <LayoutDashboard className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total de Clientes"
            value="1,234"
            trend="+12.3%"
            icon={Users}
            description="Últimos 30 dias"
          />
          <MetricCard
            title="Agendamentos"
            value="156"
            trend="+8.2%"
            icon={Calendar}
            description="Esta semana"
          />
          <MetricCard
            title="Receita"
            value="R$ 15.290"
            trend="+23.1%"
            icon={DollarSign}
            description="Este mês"
          />
          <MetricCard
            title="Taxa de Crescimento"
            value="18.2%"
            trend="+4.3%"
            icon={TrendingUp}
            description="Comparado ao mês anterior"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                Em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
