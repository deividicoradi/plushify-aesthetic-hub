
import React from 'react';
import { Gift, Zap, Crown, Heart, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRewards } from '@/hooks/useRewards';

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

export const RewardsCard: React.FC = () => {
  const { rewards, loading } = useRewards();

  if (loading) {
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
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div className="grid grid-cols-1 gap-3">
          {rewards.map((reward) => (
            <div key={reward.id} className={`p-4 rounded-lg border border-border/50 transition-all hover:shadow-md ${!reward.available ? 'opacity-60' : ''} bg-card/30 dark:bg-card/20`}>
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
          ))}
        </div>
        
        <div className="pt-2 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            💎 Novos níveis desbloqueiam recompensas exclusivas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
