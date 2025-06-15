
import React from 'react';
import { Users, Crown, Trophy, Award, BadgeCheck } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoyaltyClient } from '@/hooks/useLoyalty';

interface LoyaltyClientsTableProps {
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

export const LoyaltyClientsTable: React.FC<LoyaltyClientsTableProps> = ({ clients }) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Todos os Clientes Fidelizados</CardTitle>
        <CardDescription>Histórico completo de pontuação e tier dos clientes</CardDescription>
      </CardHeader>
      <CardContent>
        {clients.length > 0 ? (
          <div className="rounded-md border border-border/50 bg-card/30 dark:bg-card/20">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                  <TableHead className="text-right">Total Gasto</TableHead>
                  <TableHead className="text-center">Atendimentos</TableHead>
                  <TableHead>Última Visita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/30 dark:hover:bg-muted/20 border-border/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.email || client.phone || 'Sem contato'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTierColor(client.tier)} text-xs`}>
                        {getTierIcon(client.tier)}
                        <span className="ml-1">{client.tier}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-primary">{client.totalPoints}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(client.totalSpent)}
                    </TableCell>
                    <TableCell className="text-center">{client.appointmentsCount}</TableCell>
                    <TableCell>
                      {client.lastVisit 
                        ? new Date(client.lastVisit).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente fidelizado ainda</h3>
            <p>Complete agendamentos para começar a acumular pontos para seus clientes!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
