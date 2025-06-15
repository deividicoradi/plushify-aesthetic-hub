
import React from 'react';
import { Trophy, Crown, Award, BadgeCheck } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoyaltyClient } from '@/hooks/useLoyalty';

interface TopClientsCardProps {
  clients: LoyaltyClient[];
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Diamante': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md';
    case 'Ouro': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md';
    case 'Prata': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
    default: return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md';
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

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const TopClientsCard: React.FC<TopClientsCardProps> = ({ clients }) => {
  const topClients = clients.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg">Top 5 Clientes Fidelizados</CardTitle>
        </div>
        <CardDescription>Ranking dos clientes com mais pontos acumulados</CardDescription>
      </CardHeader>
      <CardContent>
        {topClients.length > 0 ? (
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{client.name}</h3>
                    <Badge className={`${getTierColor(client.tier)} text-xs shrink-0`}>
                      {getTierIcon(client.tier)}
                      <span className="ml-1">{client.tier}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {client.email || client.phone || 'Sem contato'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-primary">{client.totalPoints} pts</div>
                  <div className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(client.totalSpent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhum cliente com pontos ainda</p>
            <p className="text-sm">Complete alguns agendamentos para ver o ranking!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
