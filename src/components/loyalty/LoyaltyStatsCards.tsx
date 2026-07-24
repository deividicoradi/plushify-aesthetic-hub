
import React from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Trophy, Target, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LoyaltyStats } from '@/hooks/useLoyalty';
import { LoyaltyMetric } from '@/hooks/loyalty/useLoyaltyDetails';

interface LoyaltyStatsCardsProps {
  stats: LoyaltyStats;
  vipCount?: number;
  challengesCount?: number;
  redemptionsCount?: number;
  redemptionsValue?: number;
  pointsCirculating?: number;
  onCardClick?: (metric: LoyaltyMetric) => void;
}

export const LoyaltyStatsCards: React.FC<LoyaltyStatsCardsProps> = ({
  stats,
  vipCount,
  challengesCount = 0,
  redemptionsCount = 0,
  redemptionsValue = 0,
  pointsCirculating,
  onCardClick,
}) => {
  const vip = vipCount ?? stats.totalClients;
  const points = pointsCirculating ?? stats.pointsDistributed;

  const clickProps = (m: LoyaltyMetric) => onCardClick ? {
    role: 'button' as const,
    tabIndex: 0,
    onClick: () => onCardClick(m),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(m); }
    },
    className: 'cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40',
  } : {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card {...clickProps('vip')} className={`border-0 shadow-sm bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-950/30 dark:to-blue-900/30 relative overflow-hidden backdrop-blur-sm ${clickProps('vip').className ?? ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Clientes VIP</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{vip}</p>
              <p className="text-[10px] sm:text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Ver detalhes →</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-200/80 dark:bg-blue-800/80 rounded-full">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card {...clickProps('challenges')} className={`border-0 shadow-sm bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-950/30 dark:to-green-900/30 relative overflow-hidden backdrop-blur-sm ${clickProps('challenges').className ?? ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Desafios Ativos</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{challengesCount}</p>
              <p className="text-[10px] sm:text-xs text-green-600/70 dark:text-green-400/70 mt-1">Ver detalhes →</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-200/80 dark:bg-green-800/80 rounded-full">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card {...clickProps('redemptions')} className={`border-0 shadow-sm bg-gradient-to-r from-purple-50/80 to-purple-100/80 dark:from-purple-950/30 dark:to-purple-900/30 relative overflow-hidden backdrop-blur-sm ${clickProps('redemptions').className ?? ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Recompensas Distribuídas</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(redemptionsValue)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Gift className="w-3 h-3 text-pink-500" />
                <span className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400">{redemptionsCount} resgates</span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-purple-200/80 dark:bg-purple-800/80 rounded-full">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card {...clickProps('points')} className={`border-0 shadow-sm bg-gradient-to-r from-orange-50/80 to-orange-100/80 dark:from-orange-950/30 dark:to-orange-900/30 relative overflow-hidden backdrop-blur-sm ${clickProps('points').className ?? ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Pontos Circulando</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{points}</p>
              <p className="text-[10px] sm:text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Ver detalhes →</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-200/80 dark:bg-orange-800/80 rounded-full">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
