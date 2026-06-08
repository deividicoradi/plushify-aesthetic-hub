
import React from 'react';
import { Gift } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useRewards } from '@/hooks/useRewards';
import { RewardItem } from './RewardItem';
import { LoadingRewards } from './LoadingRewards';

export const RewardsCard: React.FC = () => {
  const { rewards, loading } = useRewards();

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Catálogo de Recompensas
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Troque seus pontos por recompensas incríveis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        {loading ? (
          <LoadingRewards />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {rewards.map((reward) => (
              <RewardItem key={reward.id} reward={reward} />
            ))}
          </div>
        )}
        
        <div className="pt-2 text-center border-t border-border/50">
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            💎 Novos níveis desbloqueiam recompensas exclusivas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
