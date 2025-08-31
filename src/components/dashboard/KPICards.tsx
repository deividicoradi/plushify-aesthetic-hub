
import React from 'react';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

export const KPICards = ({ metrics, dashboardStats, formatCurrency }: KPICardsProps) => {
  const saldoLiquido = metrics ? metrics.totalReceitas - (metrics as any).totalDespesas : 0;
  const navigate = useNavigate();

  const handleDoubleClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(metrics?.totalReceitas || 0)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                +{metrics?.crescimentoReceitas?.toFixed(1) || '0'}% vs mês anterior
              </p>
            </div>
            <div 
              className="bg-blue-500 p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
              onDoubleClick={() => handleDoubleClick('/financial')}
              title="Duplo clique para ir ao Financeiro"
            >
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-950/50 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Clientes</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {dashboardStats.totalClients || 0}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{dashboardStats.newThisMonth || 0} este mês
              </p>
            </div>
            <div 
              className="bg-green-500 p-3 rounded-full cursor-pointer hover:bg-green-600 transition-colors"
              onDoubleClick={() => handleDoubleClick('/clients')}
              title="Duplo clique para ir aos Clientes"
            >
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-950/50 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Agendamentos</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {dashboardStats.totalAppointments || 0}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {dashboardStats.weeklyAppointments || 0} esta semana
              </p>
            </div>
            <div 
              className="bg-purple-500 p-3 rounded-full cursor-pointer hover:bg-purple-600 transition-colors"
              onDoubleClick={() => handleDoubleClick('/appointments')}
              title="Duplo clique para ir aos Agendamentos"
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-950/50 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Saldo Líquido</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatCurrency(saldoLiquido)}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Receitas - Despesas
              </p>
            </div>
            <div 
              className="bg-orange-500 p-3 rounded-full cursor-pointer hover:bg-orange-600 transition-colors"
              onDoubleClick={() => handleDoubleClick('/financial')}
              title="Duplo clique para ir ao Financeiro"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
