
import React from 'react';
import { Gift, Zap, Crown, Heart, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'service' | 'product' | 'experience';
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  available: boolean;
  popular: boolean;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    title: 'Desconto 10%',
    description: 'Em qualquer serviço',
    pointsCost: 100,
    type: 'discount',
    tier: 'Bronze',
    available: true,
    popular: true
  },
  {
    id: '2',
    title: 'Limpeza de Pele Grátis',
    description: 'Serviço completo',
    pointsCost: 250,
    type: 'service',
    tier: 'Prata',
    available: true,
    popular: false
  },
  {
    id: '3',
    title: 'Kit Cuidados Premium',
    description: 'Produtos exclusivos',
    pointsCost: 400,
    type: 'product',
    tier: 'Ouro',
    available: true,
    popular: true
  },
  {
    id: '4',
    title: 'Day Spa Completo',
    description: 'Experiência exclusiva VIP',
    pointsCost: 800,
    type: 'experience',
    tier: 'Diamante',
    available: false,
    popular: false
  }
];

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
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Catálogo de Recompensas
        </CardTitle>
        <CardDescription>Troque seus pontos por recompensas incríveis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {mockRewards.map((reward) => (
            <div key={reward.id} className={`p-4 rounded-lg border transition-all hover:shadow-md ${!reward.available ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded">
                    {getTypeIcon(reward.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{reward.title}</h4>
                      {reward.popular && (
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs">
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
        
        <div className="pt-2 text-center border-t">
          <p className="text-xs text-muted-foreground">
            💎 Novos níveis desbloqueiam recompensas exclusivas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
