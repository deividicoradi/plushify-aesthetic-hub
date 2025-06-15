
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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Catálogo de Recompensas
        </CardTitle>
        <CardDescription>Troque seus pontos por recompensas incríveis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <LoadingRewards />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {rewards.map((reward) => (
              <RewardItem key={reward.id} reward={reward} />
            ))}
          </div>
        )}
        
        <div className="pt-2 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            💎 Novos níveis desbloqueiam recompensas exclusivas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
