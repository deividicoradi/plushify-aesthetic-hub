
import React from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Trophy, Target, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LoyaltyStats } from '@/hooks/useLoyalty';

interface LoyaltyStatsCardsProps {
  stats: LoyaltyStats;
}

export const LoyaltyStatsCards: React.FC<LoyaltyStatsCardsProps> = ({ stats }) => {
  const completionRate = stats.totalClients > 0 ? ((stats.totalClients * 100) / (stats.totalClients + 50)) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Clientes VIP</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalClients}</p>
              <div className="flex items-center gap-1 mt-1">
                <Trophy className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400">+12% este mês</span>
              </div>
            </div>
            <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Desafios Ativos</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">8</p>
              <div className="flex items-center gap-1 mt-1">
                <Target className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-green-600 dark:text-green-400">3 completados hoje</span>
              </div>
            </div>
            <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
              <Target className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Recompensas Distribuídas</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.totalRevenue * 0.05)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Gift className="w-3 h-3 text-pink-500" />
                <span className="text-xs text-purple-600 dark:text-purple-400">24 resgates</span>
              </div>
            </div>
            <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-full">
              <Gift className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Pontos Circulando</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pointsDistributed}</p>
              <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
