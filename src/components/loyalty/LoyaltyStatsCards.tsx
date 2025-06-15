
import React from 'react';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LoyaltyStats } from '@/hooks/useLoyalty';

interface LoyaltyStatsCardsProps {
  stats: LoyaltyStats;
}

export const LoyaltyStatsCards: React.FC<LoyaltyStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Clientes</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalClients}</p>
            </div>
            <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Agendamentos</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalAppointments}</p>
            </div>
            <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Receita Total</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Pontos Distribuídos</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pointsDistributed}</p>
            </div>
            <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
