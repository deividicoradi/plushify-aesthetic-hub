
import React from 'react';
import { Trophy, Crown, Award, BadgeCheck, Flame, Star, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { LoyaltyClient } from '@/hooks/useLoyalty';

interface TopClientsCardProps {
  clients: LoyaltyClient[];
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

const getNextTierProgress = (totalSpent: number, currentTier: string) => {
  switch (currentTier) {
    case 'Bronze': return { next: 'Prata', required: 500, progress: (totalSpent / 500) * 100 };
    case 'Prata': return { next: 'Ouro', required: 1000, progress: ((totalSpent - 500) / 500) * 100 };
    case 'Ouro': return { next: 'Diamante', required: 2000, progress: ((totalSpent - 1000) / 1000) * 100 };
    default: return { next: 'Máximo', required: 0, progress: 100 };
  }
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const TopClientsCard: React.FC<TopClientsCardProps> = ({ clients }) => {
  const topClients = clients.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">🏆 Hall da Fama VIP</CardTitle>
            <CardDescription>Os guerreiros da beleza mais dedicados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {topClients.length > 0 ? (
          <div className="space-y-4">
            {topClients.map((client, index) => {
              const nextTier = getNextTierProgress(client.totalSpent, client.tier);
              const isTop3 = index < 3;
              
              return (
                <div key={client.id} className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${isTop3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-200 dark:border-yellow-800' : 'bg-muted/50 hover:bg-muted/70'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${isTop3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                        {index + 1}
                      </div>
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />}
                      {index === 1 && <Flame className="w-4 h-4 text-orange-500 absolute -top-1 -right-1" />}
                      {index === 2 && <Star className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />}
                    </div>
                    <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate text-sm">{client.name}</h3>
                        <Badge className={`${getTierColor(client.tier)} text-xs shrink-0`}>
                          {getTierIcon(client.tier)}
                          <span className="ml-1">{client.tier}</span>
                        </Badge>
                        {isTop3 && (
                          <Badge className="bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {client.email || client.phone || 'Sem contato'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                        <span className="text-lg font-bold text-primary">{client.totalPoints}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(client.totalSpent)}
                      </div>
                    </div>
                  </div>
                  
                  {client.tier !== 'Diamante' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Próximo nível: {nextTier.next}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(nextTier.progress)}%
                        </span>
                      </div>
                      <Progress value={Math.min(nextTier.progress, 100)} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        Faltam R$ {(nextTier.required - (client.totalSpent % nextTier.required)).toFixed(0)} para {nextTier.next}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">🎯 Hall da Fama Vazio</h3>
            <p className="text-sm">Complete agendamentos para ver seus clientes VIP aparecerem aqui!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
