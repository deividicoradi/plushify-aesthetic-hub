
import React from 'react';
import { Gift, Zap, Crown, Heart, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reward } from '@/hooks/useRewards';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'discount': return <Zap className="w-4 h-4" />;
    case 'service': return <Heart className="w-4 h-4" />;
    case 'product': return <Gift className="w-4 h-4" />;
    case 'experience': return <Crown className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Diamante': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    case 'Ouro': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900';
    case 'Prata': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    default: return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
  }
};

interface RewardItemProps {
  reward: Reward;
}

export const RewardItem = React.memo<RewardItemProps>(({ reward }) => {
  return (
    <div className={`p-4 rounded-lg border border-border/50 transition-all hover:shadow-md ${!reward.available ? 'opacity-60' : ''} bg-card/30 dark:bg-card/20`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded">
            {getTypeIcon(reward.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{reward.title}</h4>
              {reward.popular && (
                <Badge className="bg-orange-100/80 text-orange-700 dark:bg-orange-900/80 dark:text-orange-300 text-xs">
                  🔥 Popular
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{reward.description}</p>
          </div>
        </div>
        <Badge className={`text-xs ${getTierColor(reward.tier)}`}>
          {reward.tier}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span className="text-sm font-bold text-primary">{reward.pointsCost} pontos</span>
        </div>
        <Button 
          size="sm" 
          variant={reward.available ? "default" : "secondary"}
          disabled={!reward.available}
          className="text-xs"
        >
          {reward.available ? 'Resgatar' : 'Indisponível'}
        </Button>
      </div>
    </div>
  );
});

RewardItem.displayName = 'RewardItem';
