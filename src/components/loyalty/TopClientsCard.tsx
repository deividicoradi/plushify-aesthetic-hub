
import React from 'react';
import { Trophy, Crown, Award, BadgeCheck, Flame, Star, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { LoyaltyClient, LoyaltyTierInfo } from '@/hooks/useLoyalty';

interface TopClientsCardProps {
  clients: LoyaltyClient[];
  tiers: LoyaltyTierInfo[];
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Diamante': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg';
    case 'Ouro': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg';
    case 'Prata': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg';
    default: return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg';
  }
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'Diamante': return <Crown className="w-4 h-4" />;
    case 'Ouro': return <Trophy className="w-4 h-4" />;
    case 'Prata': return <Award className="w-4 h-4" />;
    default: return <BadgeCheck className="w-4 h-4" />;
  }
};

const getNextTierProgress = (totalSpent: number, currentTier: string, tiers: LoyaltyTierInfo[]) => {
  const sorted = [...tiers].sort((a, b) => Number(a.min_spent) - Number(b.min_spent));
  const idx = sorted.findIndex(t => t.name === currentTier);

  if (idx === -1 || idx === sorted.length - 1) {
    return { next: 'Máximo', remaining: 0, progress: 100 };
  }

  const current = sorted[idx];
  const next = sorted[idx + 1];
  const span = Number(next.min_spent) - Number(current.min_spent);
  const progress = span > 0 ? ((totalSpent - Number(current.min_spent)) / span) * 100 : 100;

  return { next: next.name, remaining: Math.max(Number(next.min_spent) - totalSpent, 0), progress };
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const TopClientsCard: React.FC<TopClientsCardProps> = ({ clients, tiers }) => {
  const topClients = clients.slice(0, 5);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">🏆 Hall da Fama VIP</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Os guerreiros da beleza mais dedicados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {topClients.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {topClients.map((client, index) => {
              const nextTier = getNextTierProgress(client.totalSpent, client.tier, tiers);
              const isTop3 = index < 3;
              
              return (
                <div key={client.id} className={`p-3 sm:p-4 rounded-xl transition-all hover:scale-[1.01] sm:hover:scale-[1.02] ${isTop3 ? 'bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-950/30 dark:to-orange-950/30 border-2 border-yellow-200/50 dark:border-yellow-800/30' : 'bg-muted/30 hover:bg-muted/50 dark:bg-muted/20 dark:hover:bg-muted/40'}`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="relative">
                      <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm ${isTop3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                        {index + 1}
                      </div>
                      {index === 0 && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 absolute -top-1 -right-1" />}
                      {index === 1 && <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 absolute -top-1 -right-1" />}
                      {index === 2 && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 absolute -top-1 -right-1" />}
                    </div>
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white/50 dark:border-gray-700 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-xs sm:text-sm">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                        <h3 className="font-bold truncate text-xs sm:text-sm">{client.name}</h3>
                        <Badge className={`${getTierColor(client.tier)} text-[10px] sm:text-xs shrink-0`}>
                          {getTierIcon(client.tier)}
                          <span className="ml-1">{client.tier}</span>
                        </Badge>
                        {isTop3 && (
                          <Badge className="bg-gradient-to-r from-pink-400 to-purple-500 text-white text-[10px] sm:text-xs">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                        {client.email || client.phone || 'Sem contato'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                        <span className="text-base sm:text-lg font-bold text-primary">{client.totalPoints}</span>
                      </div>
                      <div className="text-[11px] sm:text-xs text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(client.totalSpent)}
                      </div>
                    </div>
                  </div>
                  
                  {nextTier.next !== 'Máximo' && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Próximo nível: {nextTier.next}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(Math.min(Math.max(nextTier.progress, 0), 100))}%
                        </span>
                      </div>
                      <Progress value={Math.min(Math.max(nextTier.progress, 0), 100)} className="h-1.5" />
                      <p className="text-[11px] sm:text-xs text-muted-foreground">
                        Faltam R$ {nextTier.remaining.toFixed(0)} para {nextTier.next}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">🎯 Hall da Fama Vazio</h3>
            <p className="text-xs sm:text-sm">Complete agendamentos para ver seus clientes VIP aparecerem aqui!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
